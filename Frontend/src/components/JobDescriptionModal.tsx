import React, { useState } from "react";
import { ClipboardList, X } from "lucide-react";

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyJobDescription: (jdText: string) => void;
  currentJd: string;
}

export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  onApplyJobDescription,
  currentJd,
}) => {
  const [text, setText] = useState(currentJd);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-border-200 shadow-xl w-full max-w-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-brand-600" />
            <h3 className="font-headline-sm font-semibold text-ink-900">
              Attach Job Description Benchmark
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="font-body-sm text-ink-500 mb-4">
          Paste role requirements or a job description. Subsequent candidate inquiries will compute tailored ATS match percentages and competency alignments.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Seeking Senior Backend / Full-Stack Engineer with 4+ years Python, FastAPI, React, and distributed cloud microservices..."
          className="jd-modal-textarea"
        />

        <div className="flex items-center justify-end gap-2">
          {currentJd && (
            <button
              type="button"
              onClick={() => {
                setText("");
                onApplyJobDescription("");
                onClose();
              }}
              className="px-3 py-2 text-[13px] font-medium text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer mr-auto"
            >
              Clear benchmark
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-border-200 text-ink-900 hover:bg-surface-100 rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyJobDescription(text);
              onClose();
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[13px] font-medium transition-all shadow-none cursor-pointer active:scale-[0.98] hover:-translate-y-px"
          >
            Apply Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
