import React, { useRef } from "react";
import { ResumeData } from "../types";
import { SAMPLE_RESUMES } from "../data/resumes";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-border-200 shadow-xl w-full max-w-md p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-600 text-[22px]">
              upload_file
            </span>
            <h3 className="font-headline-sm font-semibold text-ink-900">
              Select or Upload Resume
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 p-1 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUploadFile(e.target.files[0]);
              onClose();
            }
          }}
          className="sr-only"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-200 hover:border-brand-600 bg-surface-50 hover:bg-brand-50/30 rounded-xl p-5 text-center cursor-pointer transition-all mb-4"
        >
          <span className="material-symbols-outlined text-brand-600 text-[28px] mb-1">
            cloud_upload
          </span>
          <p className="font-body-sm font-medium text-ink-900">
            Upload new resume (PDF only)
          </p>
          <p className="text-[12px] text-ink-500">Click to browse your files</p>
        </div>

        {/* Sample dossier section removed as requested */}

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
