import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function GraphLegend() {
  return (
    <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2 text-slate-700">
      <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
        Automaton Legend
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center text-blue-600">
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
        <span>Start State (q0)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border border-slate-700 p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-full border border-slate-700" />
        </div>
        <span>Accepting / Final State</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border border-blue-600 bg-blue-100 flex items-center justify-center font-bold text-[10px] text-blue-800">
          q
        </div>
        <span>Current Simulation State</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 bg-blue-600" />
        <span>Active Transition</span>
      </div>
    </div>
  );
}

