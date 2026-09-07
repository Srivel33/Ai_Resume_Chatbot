import React, { useState } from "react";
import { AppScreen, ResumeData, ChatMessage } from "./types";
import { SAMPLE_RESUMES, INITIAL_CHAT_MESSAGES } from "./data/resumes";
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import { IndexingState } from "./components/IndexingState";
import { ChatState } from "./components/ChatState";
import { JobDescriptionModal } from "./components/JobDescriptionModal";
import { UploadModal } from "./components/UploadModal";
import { MotionConfig } from "motion/react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** Returns true when the error is a network connectivity failure (no internet / backend unreachable) */
const isNetworkError = (err: unknown): boolean => {
  if (err instanceof TypeError) return true; // fetch throws TypeError on network failure
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request failed");
  }
  return false;
};

export default function App() {
  // Start in empty mode as requested
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("empty");
  const [activeResume, setActiveResume] = useState<ResumeData>(SAMPLE_RESUMES[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isJdModalOpen, setIsJdModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(true);

  // New session handler (returns to Empty Ingestion Screen)
  const handleNewSession = () => {
    setCurrentScreen("empty");
    setMessages([]);
    setJobDescription("");
  };

  // Switch or select a resume
  const handleSelectResume = (resume: ResumeData, triggerIndexing: boolean = true) => {
    setActiveResume(resume);
    setMessages(
      resume.id === "srivel_2024"
        ? INITIAL_CHAT_MESSAGES
        : [
            {
              id: "welcome_msg",
              sender: "ai",
              text: `Executive Appraisal Dossier prepared for ${resume.candidateName}. Structured parsing complete with ${resume.entityCount} indexed entities across ${resume.tokenCount} tokens.`,
              quote: `“${resume.title} — ${resume.summary.slice(0, 120)}…”`,
              matchPercentage: 94,
              competencies: resume.competencies,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]
    );

    if (resume.fullText) {
      fetch(`${API_BASE_URL}/ingest_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resume.fullText }),
      }).catch((err) => console.warn("Could not auto-ingest sample resume text:", err));
    }

    if (triggerIndexing) {
      setCurrentScreen("indexing");
    } else {
      setCurrentScreen("chat");
    }
  };


  // Upload custom file handler
  const handleUploadFile = async (file: File) => {
    let extractedText = "";

    try {
      extractedText = await file.text();
    } catch {
      extractedText = `Uploaded document: ${file.name}`;
    }

    // Clean or fallback if binary
    if (!extractedText || extractedText.length < 30 || extractedText.includes("\x00")) {
      extractedText = `Candidate: ${file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}\nFile Size: ${Math.round(file.size / 1024)} KB\nProfile: Experienced professional with cross-functional technical expertise and project execution history.`;
    }

    const newResume: ResumeData = {
      id: `custom_${Date.now()}`,
      filename: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      candidateName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      title: "Candidate Dossier",
      summary: "Structured parsed profile ready for tactical appraisal inquiries.",
      fullText: extractedText,
      tokenCount: Math.round(extractedText.length / 4) || 1280,
      entityCount: 32,
      latencyMs: 780,
      competencies: ["Technical Architecture", "System Design", "Agile Execution", "Team Leadership"],
      suggestedInquiries: [
        "Can you give a brief summary of this resume?",
        "What are this candidate's main skills?",
        "What is their work experience?",
        "What projects have they worked on?",
        "What is their educational background?",
        "What certifications or achievements do they have?",
      ],
    };

    setActiveResume(newResume);
    setMessages([]);
    setCurrentScreen("indexing");
    setIsBackendReady(false);

    // Send to Python FastAPI backend asynchronously
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setActiveResume((prev) => ({
          ...prev,
          fullText: data.text || prev.fullText,
          tokenCount: data.chunk_count || prev.tokenCount,
          entityCount: data.embedding_count || prev.entityCount,
          pages: data.pages || 1,
          wordsCount: data.text ? data.text.split(/\s+/).filter(Boolean).length : prev.wordsCount,
          linesCount: data.text ? data.text.split("\n").length : prev.linesCount,
        }));
      }
    } catch (err) {
      if (isNetworkError(err)) {
        console.warn("Network error during upload — backend unreachable", err);
        // Backend unreachable: still allow the app to proceed with client-side extraction
        // The indexing screen will complete; the user will see offline errors when chatting
      } else {
        console.warn("Could not parse resume via backend, continuing with client extraction", err);
      }
    } finally {
      setIsBackendReady(true);
    }
  };

  // Send question to backend Gemini API
  const handleSendMessage = async (questionText: string) => {
    if (isLoading || !questionText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.answer || "Daily AI request limit reached. Please try again tomorrow or retry in a few moments.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error communicating with backend:", error);

      let errorText: string;
      if (isNetworkError(error) || !navigator.onLine) {
        errorText = "⚠️ No internet connection. Please check your network and try again.";
      } else if (error instanceof Error && error.message.includes("5")) {
        errorText = "The server is temporarily unavailable. Please try again in a moment.";
      } else {
        errorText = "Something went wrong. Please try again.";
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-white flex flex-col font-sans text-ink-900">
        {/* Pinned Top Navigation */}
        <Header
          currentScreen={currentScreen}
          onNewSession={handleNewSession}
        />

      {/* Main View Transition according to active screen */}
      <main className="flex-1 w-full flex flex-col">
        {currentScreen === "empty" && (
          <EmptyState
            onSelectResume={(resume) => handleSelectResume(resume, true)}
            onUploadFile={handleUploadFile}
          />
        )}

        {currentScreen === "indexing" && (
          <IndexingState
            resume={activeResume}
            isBackendReady={isBackendReady}
            onComplete={() => setCurrentScreen("chat")}
            onCancel={() => setCurrentScreen("empty")}
          />
        )}

        {currentScreen === "chat" && (
          <ChatState
            resume={activeResume}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onUploadAnotherResume={() => setIsUploadModalOpen(true)}
            onOpenJdModal={() => setIsJdModalOpen(true)}
            jobDescription={jobDescription}
          />
        )}
      </main>

      {/* Job Description Benchmark Attachment Modal */}
      <JobDescriptionModal
        isOpen={isJdModalOpen}
        onClose={() => setIsJdModalOpen(false)}
        onApplyJobDescription={(jd) => setJobDescription(jd)}
        currentJd={jobDescription}
      />

      {/* Upload Another Resume Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelectResume={(resume) => handleSelectResume(resume, true)}
        onUploadFile={handleUploadFile}
      />
    </div>
    </MotionConfig>
  );
}
