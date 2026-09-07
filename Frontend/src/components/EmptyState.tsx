import React, { useRef, useState } from "react";
import { ResumeData } from "../types";
import { SAMPLE_RESUMES } from "../data/resumes";
import { motion } from "motion/react";
import { TiltCard } from "./TiltCard";

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

  const startUploadSimulation = (file: File) => {
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
        className="w-full lg:w-85 shrink-0 bg-surface-50 border-b lg:border-b-0 lg:border-r border-border-200 p-6 flex flex-col self-stretch gap-6"
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
            className={`relative flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 group rounded-xl border-2 border-dashed ${
              isDragging
                ? "border-brand-600 bg-brand-50 scale-[1.01]"
                : "border-border-200 hover:border-brand-400 bg-white hover:bg-brand-50"
            } min-h-55`}
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

            {uploadProgress !== null ? (
              <div className="w-full flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 shadow-none">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
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
                  PDF only • Max 10 MB
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
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              Browse Files
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-border-200 flex items-center justify-between text-[11px] text-ink-500">
          <span>Supported ATS formats</span>
          <span className="material-symbols-outlined text-[15px] text-ink-500">
            verified_user
          </span>
        </div>
      </section>

      {/* Right Column: Interactive Process Canvas */}
      <section
        id="empty-canvas"
        className="flex-1 bg-white bg-dot-grid flex flex-col items-center justify-center p-6 lg:p-10 min-h-125 lg:min-h-0 relative overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center text-center max-w-3xl relative z-10 px-4 w-full">
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
            className="text-[28px] sm:text-[34px] font-bold text-ink-900 leading-tight tracking-tight mb-2"
          >
            AI Resume Analyzer & Insights
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
            className="font-body-md text-[15px] text-ink-500 max-w-xl mb-8"
          >
            Upload your resume to analyze skills, experience, and career strengths with AI-powered semantic search and intelligent Q&A.
          </motion.p>

          {/* 3-Step Process Guide */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.16 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left relative z-0"
          >
            {/* Desktop Connector Line (Animated Rail) */}
            <div className="hidden md:flex absolute top-10 left-[16%] right-[16%] h-px -z-10 items-center justify-start overflow-hidden bg-transparent">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-intel-600/40"
              />
            </div>
            
            {/* Step 1 */}
            <TiltCard className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-md hover:border-brand-300 cursor-default relative overflow-hidden group">
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
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
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
                  Upload your PDF or DOCX resume and let ResumeIQ extract and structure your professional profile.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                <span>Upload resume</span>
              </div>
            </TiltCard>

            {/* Step 2 */}
            <TiltCard className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-md hover:border-brand-300 cursor-default relative overflow-hidden group">
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
                    <span className="material-symbols-outlined text-[20px]">hub</span>
                    <div className="absolute top-1/2 -right-4.5 w-2 h-2 rounded-full bg-intel-600 hidden md:block"></div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
                    STEP 02
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-ink-900 mb-1.5">
                  2. Build Your Career Knowledge Base
                </h3>
                <p className="text-[12px] text-ink-500 leading-relaxed">
                  Your resume is transformed into meaningful semantic chunks and indexed for fast, context-aware retrieval.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-intel-600"></span>
                <span>Semantic vector indexing</span>
              </div>
            </TiltCard>

            {/* Step 3 */}
            <TiltCard className="bg-white border border-border-200 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-md hover:border-brand-300 cursor-default relative overflow-hidden group">
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
                    <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                    <div className="absolute top-1/2 -right-4.5 w-2 h-2 rounded-full bg-intel-600 hidden md:block"></div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 bg-surface-100 px-2 py-0.5 rounded-sm">
                    STEP 03
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-ink-900 mb-1.5">
                  3. Ask & Discover
                </h3>
                <p className="text-[12px] text-ink-500 leading-relaxed">
                  Ask questions about your experience, skills, projects, and career profile. Get AI-generated answers grounded directly in your resume.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-1.5 text-[12px] font-medium text-ink-500 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                <span>Grounded, source-aware answers</span>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
