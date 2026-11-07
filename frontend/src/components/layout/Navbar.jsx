import React, { useState } from 'react';
import { Sparkles, RotateCcw, Activity } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import ConfirmDialog from '../common/ConfirmDialog';

export default function Navbar({ onToggleSidebar }) {
  const {
    activeLanguage,
    languages,
    backendConnected,
    isCheckingHealth,
    resetWorkspace,
  } = useWorkspace();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const currentLang = languages.find((l) => l.id === activeLanguage);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">AutoLearn</span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
            TOC Studio
          </span>
        </div>

        {currentLang && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
            <span className="text-slate-400">Target Language:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
              {currentLang.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            backendConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={backendConnected ? 'Backend connected and responsive' : 'Backend offline or unreachable'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isCheckingHealth ? 'Connecting...' : backendConnected ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* Reset Workspace button */}
        <button
          onClick={() => setConfirmResetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
          title="Reset current session data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Workspace</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset Workspace?"
        message="This will clear your generated dataset, learned automaton, and simulation history. You can generate fresh data anytime."
        confirmLabel="Reset"
        isDestructive={true}
        onConfirm={() => {
          resetWorkspace();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </header>
  );
}

