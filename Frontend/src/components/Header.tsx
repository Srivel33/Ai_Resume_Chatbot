import React from "react";
import { AppScreen } from "../types";
import { FileText, Sparkles } from "lucide-react";

interface HeaderProps {
  currentScreen: AppScreen;
  onNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNewSession,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 w-full h-15 bg-white border-b border-border-200 flex items-center justify-between px-4 sm:px-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center gap-2.5">
        <div
          id="brand-logo"
          className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center shrink-0 shadow-none text-white"
        >
          <FileText size={16} strokeWidth={2.2} />
        </div>
        <span className="text-ink-900 text-[17px] font-semibold tracking-[-0.3px]">
          ResumeIQ
        </span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-100 text-ink-500 text-[13.5px] font-medium pointer-events-none select-none shadow-none">
        <Sparkles size={15} className="text-brand-600" />
        <span>AI-Powered Resume Intelligence</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="new-session-button"
          onClick={onNewSession}
          className="text-ink-900 text-[13px] font-medium border border-border-200 rounded-lg px-4 py-1.75 bg-white hover:bg-surface-100 hover:border-ink-300 transition-colors cursor-pointer shadow-none active:scale-[0.98]"
          type="button"
        >
          New Session
        </button>
      </div>
    </header>
  );
};
