import React, { useState } from 'react';
import {
  Network,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Minimize2,
  GitCompare,
  Layers,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import AutomatonGraph from '../components/automaton/AutomatonGraph';
import TransitionTable from '../components/automaton/TransitionTable';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import api from '../services/api';

export default function InspectorPage() {
  const { inferredAutomaton, referenceAutomaton, setInferredAutomaton, activeLanguage } =
    useWorkspace();

  const [activeModel, setActiveModel] = useState('inferred'); // 'inferred' or 'reference'
  const [minimizing, setMinimizing] = useState(false);
  const [checkingEquiv, setCheckingEquiv] = useState(false);
  const [equivResult, setEquivResult] = useState(null);
  const [error, setError] = useState(null);

  const displayedAutomaton =
    activeModel === 'inferred'
      ? inferredAutomaton?.automaton
      : referenceAutomaton;

  const handleMinimize = async () => {
    if (!displayedAutomaton) return;
    setMinimizing(true);
    setError(null);
    try {
      const res = await api.minimizeDFA(displayedAutomaton);
      if (activeModel === 'inferred' && inferredAutomaton) {
        setInferredAutomaton({
          ...inferredAutomaton,
          automaton: res.minimized_dfa,
          state_counts: {
            ...inferredAutomaton.state_counts,
            minimized_states: res.minimized_state_count,
          },
        });
      }
      alert(`Minimization complete. States: ${res.original_state_count} -> ${res.minimized_state_count} (${res.states_removed} removed).`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Minimization failed');
    } finally {
      setMinimizing(false);
    }
  };

  const handleCheckEquivalence = async () => {
    if (!inferredAutomaton?.automaton || !referenceAutomaton) {
      setError('Both an inferred DFA and a reference DFA are required to check equivalence.');
      return;
    }
    setCheckingEquiv(true);
    setError(null);
    try {
      const res = await api.checkEquivalence(
        inferredAutomaton.automaton,
        referenceAutomaton
      );
      setEquivResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Equivalence check failed');
    } finally {
      setCheckingEquiv(false);
    }
  };

  if (!inferredAutomaton && !referenceAutomaton) {
    return (
      <EmptyState
        title="No Automaton to Inspect"
        description="Learn an automaton using RPNI or select a built-in language to view its state-transition diagram."
        actionLabel="Go to Learning Page"
        onAction={() => (window.location.href = '/learn')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Automaton Inspector</h1>
          <p className="text-xs text-slate-500">
            Interactive state diagram and formal transition table.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Inferred vs Reference */}
          {referenceAutomaton && inferredAutomaton && (
            <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-medium">
              <button
                onClick={() => setActiveModel('inferred')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeModel === 'inferred'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inferred DFA
              </button>
              <button
                onClick={() => setActiveModel('reference')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeModel === 'reference'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reference DFA
              </button>
            </div>
          )}

          {/* Minimize button */}
          <button
            onClick={handleMinimize}
            disabled={minimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{minimizing ? 'Minimizing...' : 'Minimize DFA'}</span>
          </button>

          {/* Equivalence Check button */}
          {inferredAutomaton && referenceAutomaton && (
            <button
              onClick={handleCheckEquivalence}
              disabled={checkingEquiv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{checkingEquiv ? 'Checking...' : 'Check Equivalence (BFS)'}</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Equivalence Result Banner */}
      {equivResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            equivResult.equivalent
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {equivResult.equivalent ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">
              {equivResult.equivalent
                ? 'Exact Formal Equivalence Confirmed'
                : 'Automata are Inequivalent'}
            </div>
            <p>{equivResult.explanation}</p>
            {equivResult.distinguishing_string !== null && (
              <p className="font-mono pt-1">
                Distinguishing string: <strong>'{equivResult.distinguishing_string}'</strong> (one machine accepts, the other rejects).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interactive Graph Canvas */}
      <AutomatonGraph
        automaton={displayedAutomaton}
        title={activeModel === 'inferred' ? 'Inferred Automaton' : 'Target Reference DFA'}
        badge={activeModel === 'inferred' ? 'RPNI Result' : 'Reference'}
        className="h-[520px]"
      />

      {/* Transition Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Transition Function δ(q, a)</span>
        </h3>
        <TransitionTable automaton={displayedAutomaton} />
      </div>
    </div>
  );
}

