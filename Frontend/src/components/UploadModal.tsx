import React, { useRef, useState } from "react";
import { ResumeData } from "../types";
import { SAMPLE_RESUMES } from "../data/resumes";
import { FileUp, X, Upload, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
    return `This file is ${sizeMb} MB — too large. Please upload a resume PDF under ${MAX_FILE_SIZE_MB} MB. Try compressing or re-saving it.`;
  }
  const nonResume = NON_RESUME_PATTERNS.find((p) => p.test(file.name));
  if (nonResume) {
    return `"${file.name}" doesn't look like a resume. Please upload your CV or resume PDF.`;
  }
  return null;
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResume: (resume: ResumeData) => void;
  onUploadFile: (file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectResume,
  onUploadFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-border-200 shadow-xl w-full max-w-md p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileUp size={22} className="text-brand-600" />
            <h3 className="font-headline-sm font-semibold text-ink-900">
              Select or Upload Resume
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              const err = validateFile(file);
              if (err) {
                setFileError(err);
                e.target.value = "";
                return;
              }
              setFileError(null);
              onUploadFile(file);
              onClose();
            }
          }}
          className="sr-only"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-200 hover:border-brand-600 bg-surface-50 hover:bg-brand-50/30 rounded-xl p-5 text-center cursor-pointer transition-all mb-4 flex flex-col items-center justify-center"
        >
          <Upload size={28} className="text-brand-600 mb-1" />
          <p className="font-body-sm font-medium text-ink-900">
            Upload new resume (PDF only)
          </p>
          <p className="text-[12px] text-ink-500">Click to browse your files</p>
        </div>

        {/* Sample dossier section removed as requested */}

        {/* Error message */}
        {fileError && (
          <div className="flex items-start gap-2.5 bg-danger-50 border border-danger-600/30 rounded-lg px-3.5 py-3 mb-3">
            <AlertCircle size={18} className="text-danger-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-danger-600 font-medium leading-relaxed">{fileError}</p>
              <button
                type="button"
                onClick={() => setFileError(null)}
                className="text-[11px] text-danger-600 underline mt-1 cursor-pointer hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 bg-white border border-border-200 text-ink-900 hover:bg-surface-100 rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
