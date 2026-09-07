import React, { useRef, useState } from "react";
import { ResumeData } from "../types";
import { SAMPLE_RESUMES } from "../data/resumes";
import { motion } from "motion/react";
import { AlertCircle, Upload, FolderOpen, ShieldCheck, FileUp, Network, MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onSelectResume: (resume: ResumeData) => void;
  onUploadFile: (file: File) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectResume,
  onUploadFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  // Non-resume document patterns to warn about
  const NON_RESUME_PATTERNS = [
    /invoice/i, /receipt/i, /contract/i, /agreement/i, /report/i,
    /statement/i, /bill/i, /order/i, /ticket/i, /certificate/i,
    /manual/i, /handbook/i, /policy/i, /brochure/i, /proposal/i,
  ];

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return "Only PDF files are supported. Please upload a PDF resume.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return `This file is ${sizeMb} MB. Please upload a PDF smaller than ${MAX_FILE_SIZE_MB} MB. Try compressing your resume or saving it as a smaller PDF.`;
    }
    const nonResume = NON_RESUME_PATTERNS.find((p) => p.test(file.name));
    if (nonResume) {
      return `"${file.name}" doesn't look like a resume. Please upload your CV or resume PDF for best results.`;
    }
    return null;
  };

  const startUploadSimulation = (file: File) => {
    setUploadError(null);
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      // Reset file input so user can re-select the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadProgress(0);
    const totalDuration = 600;
    const intervalMs = 20;
    const steps = totalDuration / intervalMs;
    const increment = 100 / steps;
    let currentPct = 0;

    const interval = setInterval(() => {
      currentPct += increment;
      if (currentPct >= 100) {
        setUploadProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          onUploadFile(file);
        }, 200);
      } else {
        setUploadProgress(Math.round(currentPct));
      }
    }, intervalMs);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startUploadSimulation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startUploadSimulation(e.target.files[0]);
    }
  };

  return (
    <div
      id="empty-screen"
      className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-60px)] bg-surface-50"
    >
      {/* Left Column: Dossier Ingestion Rail */}
      <section
        id="ingestion-rail"
        className="w-full lg:w-85 shrink-0 bg-surface-50 border-b lg:border-b-0 lg:border-r border-border-200 p-4 sm:p-6 flex flex-col self-stretch gap-4 sm:gap-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink-500 block font-semibold font-label-micro">
              Your Resume
            </span>
            <span className="text-[11px] font-medium text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
              1 resume
            </span>
          </div>

          {/* Interactive Dropzone */}
          <div
            id="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 group rounded-xl border-2 border-dashed ${
              uploadError
                ? "border-danger-600 bg-danger-50"
                : isDragging
                ? "border-brand-600 bg-brand-50 scale-[1.01]"
                : "border-border-200 hover:border-brand-400 bg-white hover:bg-brand-50"
            } min-h-40 sm:min-h-55`}
          >
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload resume file"
            />

            {uploadError ? (
              <div className="w-full flex flex-col items-center justify-center p-2 pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-danger-50 flex items-center justify-center text-danger-600 mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-headline-sm font-semibold text-danger-600 mb-2 text-[14px]">
                  Upload failed
                </h3>
                <p className="text-[12px] text-danger-600 leading-relaxed max-w-65">
                  {uploadError}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUploadError(null); }}
                  className="mt-3 px-3 py-1 rounded-lg text-[11px] font-medium bg-white border border-danger-600 text-danger-600 hover:bg-danger-50 transition-colors pointer-events-auto cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : uploadProgress !== null ? (
              <div className="w-full flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-none">
                  <Upload size={24} />
                </div>
                <h3 className="font-headline-sm font-semibold text-ink-900 mb-4">Uploading resume...</h3>
                <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden border border-border-200">
                  <motion.div
                    className="bg-brand-600 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <span className="text-label-micro font-label-micro font-medium text-ink-500 mt-2">
                  {uploadProgress}%
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-3 transition-transform duration-200 group-hover:scale-110">
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 stroke-current fill-none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="8" x2="16" y1="13" y2="13"></line>
                    <line x1="8" x2="13" y1="17" y2="17"></line>
                  </svg>
                </div>

                <h2 className="font-headline-sm text-[15px] font-semibold text-ink-900 mb-1 tracking-tight">
                  Drop your resume here
                </h2>
                <p className="font-body-sm text-[12px] text-ink-500 mb-3">
                  Resume PDF only • Max 10 MB
                </p>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-surface-100 border border-border-200 text-ink-500">
                    PDF
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col gap-2">
            <button
              id="browse-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-lg bg-linear-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-700 text-white font-medium text-[13px] text-center active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_4px_rgba(217,119,6,0.2)] hover:-translate-y-px"
            >
              <FolderOpen size={18} />
              Browse Files
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-border-200 flex items-center justify-between text-[11px] text-ink-500">
          <span>Supported ATS formats</span>
          <ShieldCheck size={16} className="text-ink-500" />
        </div>
      </section>

      {/* Right Column: Interactive Process Canvas */}
      <section
        id="empty-canvas"
        className="flex-1 bg-white bg-dot-grid flex flex-col items-center justify-center p-5 sm:p-6 lg:p-10 min-h-105 sm:min-h-125 lg:min-h-0 relative overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center text-center max-w-3xl relative z-10 px-2 sm:px-4 w-full">
          {/* Signature Illustrated Moment */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute -top-16 -right-4 lg:-right-16 -z-10 pointer-events-none"
          >
            <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Document Frame */}
              <rect x="60" y="40" width="80" height="110" rx="6" stroke="currentColor" className="text-ink-900/10" strokeWidth="2" strokeDasharray="4 4" />
              {/* Data Connections */}
              <line x1="140" y1="70" x2="190" y2="50" stroke="currentColor" className="text-intel-600/30" strokeWidth="1.5" />
              <circle cx="190" cy="50" r="4" stroke="currentColor" className="text-intel-600/40" strokeWidth="2" />
              <line x1="140" y1="100" x2="200" y2="110" stroke="currentColor" className="text-brand-600/30" strokeWidth="1.5" />
              <circle cx="200" cy="110" r="4" stroke="currentColor" className="text-brand-600/40" strokeWidth="2" />
              <line x1="70" y1="150" x2="50" y2="180" stroke="currentColor" className="text-intel-600/20" strokeWidth="1.5" />
              <circle cx="50" cy="180" r="3" stroke="currentColor" className="text-intel-600/30" strokeWidth="1.5" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-ink-900 leading-tight tracking-tight mb-2"
          >
            AI Resume Q&A — Ask Anything About Your Resume
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
            className="font-body-md text-[15px] text-ink-500 max-w-xl mb-8"
          >
            Upload your PDF resume. Our AI reads it, organizes it, and answers any question you ask — instantly, using only the information in your document.
          </motion.p>

          {/* 3-Step Process Guide */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.16 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left relative z-0"
          >
            {/* Desktop Connector Line (Animated Rail) */}
            <div className="hidden md:flex absolute top-10 left-[16%] right-[16%] h-px z-0 items-center justify-start overflow-hidden pointer-events-none">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-intel-600/40"
              />
            </div>
            
            {/* Step 1 */}
            <div className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-brand-300 cursor-default relative overflow-hidden group z-10">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="absolute -bottom-6 -right-2 text-[140px] font-bold text-ink-900/3 leading-none pointer-events-none select-none z-0 tracking-tighter"
              >
                01
              </motion.span>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 relative">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-ink-500 relative">
                    <FileUp size={20} />
                    <div className="absolute top-1/2 -right-4.5 w-2 h-2 rounded-full bg-intel-600 hidden md:block"></div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
                    STEP 01
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-ink-900 mb-1.5">
                  1. Upload Your Resume
                </h3>
                <p className="text-[12px] text-ink-500 leading-relaxed">
                  Upload your PDF resume so the AI can read and understand your skills, projects, and work history.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                <span>Resume Upload</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-brand-300 cursor-default relative overflow-hidden group z-10">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="absolute -bottom-6 -right-2 text-[140px] font-bold text-ink-900/3 leading-none pointer-events-none select-none z-0 tracking-tighter"
              >
                02
              </motion.span>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 relative">
                  <div className="w-10 h-10 rounded-lg bg-intel-50 flex items-center justify-center text-intel-600 relative">
                    <Network size={20} />
                    <div className="absolute top-1/2 -right-4.5 w-2 h-2 rounded-full bg-intel-600 hidden md:block"></div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
                    STEP 02
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-ink-900 mb-1.5">
                  2. AI Organizes Your Info
                </h3>
                <p className="text-[12px] text-ink-500 leading-relaxed">
                  The system sorts your resume into organized sections so the AI can quickly find the exact details you need.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-intel-600"></span>
                <span>Smart Organization</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-brand-300 cursor-default relative overflow-hidden group z-10">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className="absolute -bottom-6 -right-2 text-[140px] font-bold text-ink-900/3 leading-none pointer-events-none select-none z-0 tracking-tighter"
              >
                03
              </motion.span>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 relative">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-ink-500 relative">
                    <MessageSquare size={20} />
                    <div className="absolute top-1/2 -right-4.5 w-2 h-2 rounded-full bg-intel-600 hidden md:block"></div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
                    STEP 03
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-ink-900 mb-1.5">
                  3. Ask Any Question
                </h3>
                <p className="text-[12px] text-ink-500 leading-relaxed">
                  Ask anything about your qualifications, experience, or achievements and get clear, instant answers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                <span>Instant Answers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
