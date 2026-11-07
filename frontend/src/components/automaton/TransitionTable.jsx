import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TransitionTable({ automaton }) {
  if (!automaton || !automaton.states) {
    return null;
  }

  const {
    states = [],
    alphabet = [],
    start_state = '',
    accept_states = [],
    transitions = {},
    type = 'DFA',
  } = automaton;

  const sortedStates = [...states].sort((a, b) => {
    if (a === start_state) return -1;
    if (b === start_state) return 1;
    return a.localeCompare(b);
  });

  const sortedAlphabet = [...alphabet].sort();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">Type</th>
            {sortedAlphabet.map((sym) => (
              <th key={sym} className="px-4 py-3 font-mono">
                δ(q, '{sym}')
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono">
          {sortedStates.map((state) => {
            const isStart = state === start_state;
            const isAccept = accept_states.includes(state);

            return (
              <tr key={state} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-1.5">
                  {isStart && <ArrowRight className="w-3.5 h-3.5 text-blue-600 inline" />}
                  <span>{state}</span>
                </td>
                <td className="px-4 py-3 font-sans">
                  <div className="flex gap-1">
                    {isStart && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-medium">
                        Start
                      </span>
                    )}
                    {isAccept ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Accept
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                        Reject
                      </span>
                    )}
                  </div>
                </td>
                {sortedAlphabet.map((sym) => {
                  const target = transitions[state]?.[sym];
                  let targetDisplay = '—';

                  if (target !== undefined && target !== null) {
                    if (Array.isArray(target)) {
                      targetDisplay = target.length > 0 ? `{${target.join(', ')}}` : '∅';
                    } else {
                      targetDisplay = target;
                    }
                  }

                  return (
                    <td
                      key={sym}
                      className={`px-4 py-3 ${
                        targetDisplay === '—' || targetDisplay === '∅'
                          ? 'text-slate-400'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {targetDisplay}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

