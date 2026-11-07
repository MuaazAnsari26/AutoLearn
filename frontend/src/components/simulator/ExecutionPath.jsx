import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { displayString } from '../../utils/formatters';

export default function ExecutionPath({ simulation, currentStepIndex }) {
  if (!simulation) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
        Enter a string and run simulation to view the step-by-step execution path.
      </div>
    );
  }

  const {
    type = 'DFA',
    input = '',
    accepted = false,
    start_state = '',
    final_state = '',
    final_active_states = [],
    steps = [],
    message = '',
  } = simulation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Result Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          accepted
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        {accepted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {accepted ? 'ACCEPTED' : 'REJECTED'}
            </span>
            <span className="text-xs font-mono font-medium opacity-80">
              w = {displayString(input)}
            </span>
          </div>
          <p className="mt-1 text-xs opacity-90 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Trace Timeline */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Execution Trace ({type})
        </div>

        {steps.length === 0 ? (
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 font-mono">
            Empty string input (ε): Evaluated directly on start state '{start_state}'.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-200 rounded-lg text-xs font-mono">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`px-3 py-2.5 flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : isPast
                      ? 'text-slate-600 bg-white'
                      : 'text-slate-400 bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-6 text-slate-400 font-sans">
                      #{idx + 1}
                    </span>
                    {type === 'NFA' ? (
                      <span>
                        {'{' + (step.from_states || []).join(', ') + '}'}
                      </span>
                    ) : (
                      <span>{step.from_state}</span>
                    )}

                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>'{step.symbol}'</span>
                    </div>

                    {type === 'NFA' ? (
                      <span className="text-blue-700">
                        {'{' + (step.to_states || []).join(', ') + '}'}
                      </span>
                    ) : (
                      <span className="text-blue-700">{step.to_state}</span>
                    )}
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-sans uppercase font-bold text-blue-600 px-2 py-0.5 bg-blue-100 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

