import React, { useState, useRef, useEffect } from "react";
import { ResumeData, ChatMessage } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Quote } from "lucide-react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { TiltCard } from "./TiltCard";

const Counter = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 0.8, delay, ease: "easeOut" });
    return animation.stop;
  }, [value, delay, count]);

  return <motion.span>{rounded}</motion.span>;
};

const StreamedMessage = ({ content }: { content: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.length) {
        i += Math.floor(Math.random() * 4) + 2;
        setDisplayedText(content.slice(0, i));
      } else {
        setDisplayedText(content);
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>;
};

interface ChatStateProps {
  resume: ResumeData;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onUploadAnotherResume: () => void;
  onOpenJdModal: () => void;
  jobDescription: string;
}

export const ChatState: React.FC<ChatStateProps> = ({
  resume,
  messages,
  onSendMessage,
  isLoading,
  onUploadAnotherResume,
  onOpenJdModal,
  jobDescription,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isInsightsReady, setIsInsightsReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatThreadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxInsightVal = Math.max(
    resume.pages || 1,
    resume.tokenCount || 4,
    resume.wordsCount || 399,
    resume.linesCount || 42
  );

  // Artificial delay for Document Insights to skeleton first
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInsightsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue.trim();
    setInputValue("");
    onSendMessage(query);
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const handleCompetencyClick = (comp: string) => {
    if (isLoading) return;
    onSendMessage(`What is this candidate's proficiency and track record in ${comp}?`);
  };


  return (
    <div
      id="chat-screen"
      className="flex flex-col lg:flex-row w-full h-[calc(100vh-60px)] overflow-hidden bg-surface-50 relative"
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border-200 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-brand-600 text-[20px]">
             description
           </span>
           <span className="font-semibold text-ink-900 text-sm truncate max-w-50">
             {resume.filename}
           </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-ink-500 hover:text-ink-900 bg-surface-100 p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Left column (Resume Reference & Tactical Prompts) */}
      <aside
        id="resume-sidebar"
        className={`${
          isSidebarOpen ? "flex absolute top-26 bottom-0 left-0 right-0 z-40 bg-surface-50" : "hidden"
        } lg:relative lg:top-0 lg:flex lg:w-85 shrink-0 bg-surface-50 border-r border-border-200 p-4 sm:p-6 flex-col justify-between overflow-y-auto`}
      >
        <div className="flex flex-col">
          {/* Section: Resume Identification */}
          <span className="font-label-micro text-label-micro text-ink-500 uppercase tracking-[0.2em] mb-4 select-none font-semibold">
            YOUR RESUME
          </span>

          {/* Document Dossier Card */}
          <div className="bg-white rounded-xl p-4 border border-border-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] flex items-center gap-3 mb-6 transition-all hover:border-brand-600/30 group">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-brand-600 text-[22px]">
                description
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-body-sm text-body-sm font-semibold text-ink-900 truncate"
                  title={resume.filename}
                >
                  {resume.filename}
                </span>
                <span className="flex items-center gap-1.5 shrink-0 bg-success-50 px-2 py-0.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-600"></span>
                  <span className="font-label-micro text-label-micro text-success-600 font-semibold uppercase tracking-normal">
                    Ready
                  </span>
                </span>
              </div>
              <span className="font-label-regular text-label-regular text-ink-500 mt-0.5">
                {resume.sizeKb} KB · Structured Parsing Complete
              </span>
            </div>
          </div>

          <button
            onClick={onUploadAnotherResume}
            className="w-full mt-2 mb-4 py-2 px-3 rounded-lg border border-border-200 hover:border-ink-300 bg-white hover:bg-surface-100 text-ink-900 shadow-none transition-all flex items-center justify-center gap-2 font-label-regular text-label-regular font-medium cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-brand-600 text-[18px]">
              upload_file
            </span>
            <span>Upload another resume</span>
          </button>

          <div className="w-full border-b border-border-200 my-2"></div>

          {/* Processing Metrics */}
          <div className="mt-8 bg-white rounded-xl p-5 border border-border-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] group">
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-micro text-label-micro text-ink-500 uppercase tracking-wider font-semibold">
                Document Insights
              </span>
              <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-ink-500">
                <span className="material-symbols-outlined text-[18px]">
                  analytics
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-label-regular text-ink-500">Pages</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-surface-50 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div className="bg-intel-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: isInsightsReady ? `${((resume.pages || 1) / maxInsightVal) * 100}%` : '0%' }}></div>
                  </div>
                  <span className="font-label-regular text-ink-900 font-semibold w-8 text-right">
                    {isInsightsReady ? (
                      <Counter value={resume.pages || 1} delay={0} />
                    ) : (
                      <div className="w-8 h-4 bg-surface-100 animate-pulse rounded inline-block"></div>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-regular text-ink-500">Chunk count</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-surface-50 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div className="bg-intel-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: isInsightsReady ? `${((resume.tokenCount || 4) / maxInsightVal) * 100}%` : '0%' }}></div>
                  </div>
                  <span className="font-label-regular text-ink-900 font-semibold w-8 text-right">
                    {isInsightsReady ? (
                      <Counter value={resume.tokenCount || 4} delay={0.06} />
                    ) : (
                      <div className="w-8 h-4 bg-surface-100 animate-pulse rounded inline-block"></div>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-regular text-ink-500">Words count</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-surface-50 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div className="bg-intel-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: isInsightsReady ? `${((resume.wordsCount || 399) / maxInsightVal) * 100}%` : '0%' }}></div>
                  </div>
                  <span className="font-label-regular text-ink-900 font-semibold w-8 text-right">
                    {isInsightsReady ? (
                      <Counter value={resume.wordsCount || 399} delay={0.12} />
                    ) : (
                      <div className="w-8 h-4 bg-surface-100 animate-pulse rounded inline-block"></div>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-regular text-ink-500">Lines count</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-surface-50 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div className="bg-intel-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: isInsightsReady ? `${((resume.linesCount || 42) / maxInsightVal) * 100}%` : '0%' }}></div>
                  </div>
                  <span className="font-label-regular text-ink-900 font-semibold w-8 text-right">
                    {isInsightsReady ? (
                      <Counter value={resume.linesCount || 42} delay={0.18} />
                    ) : (
                      <div className="w-8 h-4 bg-surface-100 animate-pulse rounded inline-block"></div>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Micro-Metadata */}
        <div className="pt-4 border-t border-border-200 flex items-center justify-between mt-6">
          <span className="font-label-micro text-label-micro text-ink-500 uppercase tracking-widest font-semibold">
            System Status
          </span>
          <span className="font-label-micro text-label-micro text-success-600 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success-600"></span>
            Online
          </span>
        </div>
      </aside>

      {/* Right Column (Executive Synthesis & Intelligence Stream) */}
      <section className="flex-1 bg-white bg-dot-grid flex flex-col h-full justify-between relative overflow-hidden">
        {/* Conversation Stage */}
        <div
          ref={chatThreadRef}
          id="chatThread"
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-8 lg:px-12 space-y-6 flex flex-col"
        >


          {/* Job Description Banner if active */}
          {jobDescription && (
            <div className="bg-brand-50 rounded-xl p-3.5 text-[13px] text-ink-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-brand-600 text-[18px]">
                  verified
                </span>
                <span className="truncate">
                  Benchmarked against attached Job Requirements
                </span>
              </div>
              <button
                onClick={onOpenJdModal}
                className="text-[12px] font-medium text-brand-600 hover:underline shrink-0 cursor-pointer"
              >
                Edit benchmark
              </button>
            </div>
          )}

          {/* Messages Stream */}
          {messages.length === 0 && (
            <div className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto py-3 sm:py-6 px-3 sm:px-4 w-full relative z-10">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-intel-600 bg-brand-50 flex items-center justify-center text-brand-600 mb-2 sm:mb-3 shadow-none">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chat_bubble</span>
              </div>
              <h3 className="font-headline-sm font-bold text-ink-900 text-[15px] sm:text-[18px] mb-0.5 sm:mb-1">
                Ask about {resume.candidateName || "this resume"}
              </h3>
              <p className="text-[12px] sm:text-[13px] text-ink-500 mb-3 sm:mb-5 max-w-md hidden sm:block">
                Click any common question below to search the resume embeddings, or type your own question:
              </p>
              <p className="text-[11px] text-ink-500 mb-3 sm:hidden">
                Tap a question or type below:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full text-left">
                {resume.suggestedInquiries.map((inquiry, idx) => (
                  <TiltCard
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(inquiry)}
                    className={`p-2.5 sm:p-3.5 rounded-xl border text-[11.5px] sm:text-[13px] text-ink-900 flex items-center justify-between gap-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all cursor-pointer group text-left min-h-12 sm:min-h-14.5 h-full bg-white hover:bg-surface-50 border-border-200 hover:border-brand-300 hover:-translate-y-px border-t-[3px] ${
                      idx % 2 === 0 ? "border-t-brand-600" : "border-t-intel-600"
                    }`}
                  >
                    <span className="font-medium leading-snug line-clamp-3">{inquiry}</span>
                    <span className="material-symbols-outlined text-brand-600 text-[15px] sm:text-[18px] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
                      arrow_forward
                    </span>
                  </TiltCard>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            if (msg.sender === "user") {
              return (
                <div key={msg.id} className="flex justify-end w-full pt-2">
                  <div className="bg-ink-900 border border-ink-900 rounded-[16px_16px_4px_16px] px-6 py-4 max-w-[85%] sm:max-w-[65%] shadow-none">
                    <p className="font-body-md text-body-md text-white leading-relaxed font-normal">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            }

            const isLastAiMessage = msg.sender === "ai" && index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className="flex flex-col items-start max-w-full lg:max-w-[76%] group"
              >
                <div className="bg-white rounded-[16px_16px_16px_4px] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] border border-border-200 text-ink-900 w-full prose prose-slate max-w-none prose-p:leading-relaxed prose-li:my-1 prose-headings:font-bold min-h-13">
                  {isLastAiMessage ? (
                    <StreamedMessage content={msg.text} />
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>

                {typeof msg.matchPercentage === "number" && (
                  <div className="flex items-center gap-3 mt-3 w-full max-w-70 pl-1">
                    <div className="h-1.5 rounded-full bg-border-200 flex-1 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${msg.matchPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-label-micro text-label-micro text-ink-500 font-medium">
                        {msg.matchPercentage}% match
                      </span>
                      <span className="material-symbols-outlined text-brand-600 text-[13px]">
                        verified_user
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Synthesis Loading Bubble */}
          {isLoading && (
            <div className="flex flex-col items-start max-w-full lg:max-w-[76%]">
              <div className="bg-white rounded-[16px_16px_16px_4px] py-4 px-5 shadow-none border border-border-200 w-20 flex items-center justify-center gap-1.5 h-13">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand-600/40"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand-600/40"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-brand-600/40"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input Dispatch Cockpit (Bottom Dock) */}
        <footer
          id="chat-dock"
          className="min-h-18 bg-white px-3 sm:px-4 lg:px-12 py-3 flex items-center gap-2 sm:gap-3 lg:gap-4 border-t border-border-200 z-20 shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]"
        >
          <form
            onSubmit={handleSubmit}
            className="chat-input-cockpit"
          >
            <input
              ref={inputRef}
              id="chatInput"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this resume…"
              className="chat-input-field font-body-md text-body-md"
            />
          </form>

          <button
            id="sendBtn"
            type="button"
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isLoading}
            title="Synthesize Inquiry"
            className="w-10 h-10 bg-linear-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white rounded-lg flex items-center justify-center transition-all shrink-0 shadow-[0_2px_4px_rgba(217,119,6,0.2)] font-bold hover:-translate-y-px"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">
              arrow_upward
            </span>
          </button>
        </footer>
      </section>
    </div>
  );
};
