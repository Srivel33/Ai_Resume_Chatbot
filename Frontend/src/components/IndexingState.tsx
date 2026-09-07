import React, { useEffect, useState } from "react";
import { ResumeData } from "../types";
import { motion } from "motion/react";
import { TiltCard } from "./TiltCard";
import { FileText, FileUp, Cpu } from "lucide-react";

interface StepProps {
  label: string;
  stepNum: number;
  currentStep: number;
  isLast?: boolean;
}

const StepItem: React.FC<StepProps> = ({ label, stepNum, currentStep, isLast }) => {
  const isCompleted = currentStep > stepNum;
  const isActive = currentStep === stepNum;
  const isPending = currentStep < stepNum;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <motion.div
            initial={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
            animate={{ backgroundColor: "#16A34A", borderColor: "#16A34A" }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 rounded-full border border-success-600 shrink-0 flex items-center justify-center text-white shadow-none"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 12 12"
            >
              <path d="M2.5 6.2L4.8 8.5L9.5 3.5"></path>
            </motion.svg>
          </motion.div>
        ) : isActive ? (
          <div className="w-5 h-5 rounded-full border-2 border-intel-600 relative shrink-0 flex items-center justify-center bg-intel-50 animate-pulse ring-4 ring-intel-100">
            <div className="w-1.5 h-1.5 rounded-full bg-intel-600"></div>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-border-200 shrink-0 bg-white"></div>
        )}
        <span
          className={`font-body-sm transition-colors ${
            isCompleted
              ? "text-ink-900 font-semibold"
              : isActive
              ? "text-intel-600 font-semibold"
              : "text-ink-300"
          }`}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div className="w-px h-8 bg-border-200 ml-[9.5px] overflow-hidden flex items-start">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: isCompleted ? "100%" : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full bg-intel-600"
            />
        </div>
      )}
    </div>
  );
};

interface IndexingStateProps {
  resume: ResumeData;
  isBackendReady: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export const IndexingState: React.FC<IndexingStateProps> = ({
  resume,
  isBackendReady,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [percentage, setPercentage] = useState<number>(15);
  const [subStatus, setSubStatus] = useState<string>("Extracting content & text sections...");

  const isBackendReadyRef = React.useRef(isBackendReady);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    isBackendReadyRef.current = isBackendReady;
    onCompleteRef.current = onComplete;
  }, [isBackendReady, onComplete]);

  useEffect(() => {
    // Smooth progress progression running every 30ms over ~1.2 seconds
    const totalDuration = 1200;
    const intervalMs = 30;
    const steps = totalDuration / intervalMs;
    const increment = (100 - 15) / steps;
    let currentPct = 15;

    const interval = setInterval(() => {
      currentPct += increment;
      if (currentPct >= 100) {
        if (!isBackendReadyRef.current) {
            currentPct = 99;
            setPercentage(99);
            setSubStatus("Finalizing indexing on backend...");
            return;
        }
        currentPct = 100;
        setPercentage(100);
        setCurrentStep(4);
        setSubStatus("Index ready! Opening conversation...");
        clearInterval(interval);
        setTimeout(() => {
          onCompleteRef.current();
        }, 350);
        return;
      }

      const rounded = Math.round(currentPct);
      setPercentage(rounded);

      if (rounded < 40) {
        setSubStatus("Extracting content & text sections...");
        setCurrentStep(1);
      } else if (rounded < 70) {
        setSubStatus("Chunking semantic vector embeddings...");
        setCurrentStep(2);
      } else if (rounded < 90) {
        setSubStatus("Indexing into ChromaDB vector store...");
        setCurrentStep(3);
      } else {
        setSubStatus("Structuring candidate profile...");
        setCurrentStep(3);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      id="indexing-screen"
      className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-60px)] bg-surface-50"
    >
      {/* Left Column (Ingestion & Pipeline Dossier Stage) */}
      <aside
        id="indexing-sidebar"
        className="w-full lg:w-85 shrink-0 bg-surface-50 border-b lg:border-b-0 lg:border-r border-border-200 p-4 sm:p-6 flex flex-col justify-between"
      >
        <div className="flex flex-col">
          {/* Section Micro Label */}
          <span className="font-label-micro text-ink-500 tracking-[0.2em] uppercase mb-4 font-semibold">
            YOUR RESUME
          </span>

          {/* File Card */}
          <div className="bg-white rounded-xl p-5 border border-border-200 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-center gap-3.5 mb-3">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <FileText size={20} className="text-brand-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-md font-semibold text-ink-900 truncate">
                {resume.filename}
              </span>
              <span className="font-label-regular text-ink-500 mt-0.5 font-medium">
                {resume.sizeKb} KB
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 mb-4 sm:mb-8 py-2 px-3 border border-border-200 hover:border-ink-300 text-ink-900 hover:bg-surface-100 rounded-lg font-label-regular transition-colors bg-white cursor-pointer"
            type="button"
          >
            <FileUp size={18} className="text-brand-600" />
            <span className="font-medium">Upload another resume</span>
          </button>

          {/* Pipeline Progress Section */}
          <div className="flex flex-col">
            <span className="font-label-micro text-ink-500 tracking-[0.2em] uppercase mb-5 font-semibold">
              ANALYSING
            </span>

            {/* Connected Progression Line */}
            <div className="flex flex-col">
              <StepItem label="Reading the document" stepNum={1} currentStep={currentStep} />
              <StepItem label="Extracting content" stepNum={2} currentStep={currentStep} />
              <StepItem label="Building knowledge index" stepNum={3} currentStep={currentStep} />
              <StepItem label="Ready to answer" stepNum={4} currentStep={currentStep} isLast />
            </div>
          </div>
        </div>

        {/* Left Rail Footer Metadata */}
        <div className="pt-6 border-t border-border-200 flex items-center justify-between text-ink-500">
          <span className="font-label-micro uppercase tracking-widest text-ink-500 font-semibold">
            ChromaDB Vector Store
          </span>
          <span className="font-label-micro font-semibold text-success-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success-600 animate-pulse"></span>
            Engine Active
          </span>
        </div>
      </aside>

      {/* Right Stage (Executive Focus Area) */}
      <section
        id="indexing-stage"
        className="flex-1 bg-white bg-dot-grid flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12 relative overflow-hidden"
      >
        {/* Ambient Background Illumination & Drifters */}
        <div className="absolute w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none -top-20 -right-20 z-0"></div>
        <div className="absolute w-80 h-80 rounded-full bg-slate-200/40 blur-3xl pointer-events-none -bottom-20 -left-20 z-0"></div>

        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          className="absolute top-[20%] left-[30%] w-32 h-32 rounded-full bg-intel-100/40 blur-2xl pointer-events-none z-0"
        />
        <motion.div
          animate={{ x: [0, -30, 40, 0], y: [0, 50, -20, 0] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
          className="absolute bottom-[30%] right-[25%] w-40 h-40 rounded-full bg-intel-100/40 blur-2xl pointer-events-none z-0"
        />
        <motion.div
          animate={{ x: [0, 50, -10, 0], y: [0, 20, -50, 0] }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          className="absolute top-[60%] left-[40%] w-24 h-24 rounded-full bg-intel-100/30 blur-2xl pointer-events-none z-0"
        />

        {/* Focused State Presentation */}
        <TiltCard className="flex flex-col items-center text-center w-full max-w-lg z-10 p-6 md:p-8 rounded-2xl bg-white border border-border-200 shadow-[0_16px_40px_rgba(15,23,42,0.08),0_0_40px_rgba(204,251,241,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand-500 to-brand-600"></div>
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-intel-50 blur-2xl pointer-events-none"></div>

          {/* Circular Scanning Animation */}
          <div className="relative flex items-center justify-center mb-6 h-16 w-16">
            {/* Outer steady ring */}
            <div className="absolute inset-0 rounded-full bg-intel-100/30 border border-intel-600/20"></div>
            
            {/* Inner dashed rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              className="absolute inset-1 rounded-full border border-dashed border-intel-600/60"
            ></motion.div>
            
            {/* Center icon pulsing */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              className="relative flex items-center justify-center z-10"
            >
              <Cpu size={24} className="text-intel-600" />
            </motion.div>
          </div>

          <div className="flex items-center gap-1.5 mb-5 w-full justify-center px-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                  step < currentStep
                    ? "bg-brand-600"
                    : step === currentStep
                    ? "bg-brand-600 animate-pulse opacity-80"
                    : "bg-transparent border border-border-200"
                }`}
              />
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-label-micro uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-ping"></span>
            <span className="font-semibold">
              Step {currentStep} of 4 · {currentStep >= 4 ? "Ready" : "Indexing"}
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg font-bold text-ink-900 mb-2 tracking-tight">
            Building your resume index…
          </h2>
          <p className="font-body-md text-ink-500 mb-6 max-w-sm">
            Structuring work history, technical proficiencies, and metrics for instant contextual querying.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden mb-4 border border-border-200">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="w-full flex items-center justify-between text-label-micro text-ink-500 font-label-micro mb-2 px-0.5">
            <span>{subStatus}</span>
            <span className="text-brand-600 font-semibold">{percentage}%</span>
          </div>
        </TiltCard>
      </section>
    </div>
  );
};
