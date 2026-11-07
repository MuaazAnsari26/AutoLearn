import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Activity,
  PlayCircle,
  Network,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAutomaton } from '../hooks/useAutomaton';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import { formatMetric } from '../utils/formatters';

export default function LearningPage() {
  const navigate = useNavigate();
  const { dataset } = useWorkspace();
  const { inferredAutomaton, learning, error, learn } = useAutomaton();

  // If no generated dataset, user can enter examples manually in textareas
  const [manualPos, setManualPos] = useState('01\n101\n0011\n1101');
  const [manualNeg, setManualNeg] = useState('00\n111\n0\n10');
  const [minimize, setMinimize] = useState(true);

  const hasGeneratedDataset = Boolean(dataset && dataset.samples && dataset.samples.length > 0);

  const posCount = hasGeneratedDataset
    ? dataset.samples.filter((s) => s.label === 1).length
    : manualPos.trim().split(/\s+/).filter(Boolean).length;

  const negCount = hasGeneratedDataset
    ? dataset.samples.filter((s) => s.label === 0).length
    : manualNeg.trim().split(/\s+/).filter(Boolean).length;

  const handleLearn = async () => {
    let positiveExamples = [];
    let negativeExamples = [];

    if (hasGeneratedDataset) {
      positiveExamples = dataset.samples.filter((s) => s.label === 1).map((s) => s.string);
      negativeExamples = dataset.samples.filter((s) => s.label === 0).map((s) => s.string);
    } else {
      positiveExamples = manualPos.trim().split(/\s+/).filter((s) => s !== '');
      negativeExamples = manualNeg.trim().split(/\s+/).filter((s) => s !== '');
    }

    try {
      await learn({
        positiveExamples,
        negativeExamples,
        alphabet: dataset?.metadata?.alphabet || ['0', '1'],
        minimize,
      });
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Learn Automaton (RPNI Inference)</h1>
        <p className="text-xs text-slate-500">
          Infer a candidate DFA using genuine Regular Positive and Negative Inference state merging.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-900">Inference Parameters</h2>
          </div>

          {/* Training Data Source Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-800">
              Training Evidence: {hasGeneratedDataset ? 'Active Workspace Dataset' : 'Manual Text Input'}
            </div>
            <div className="text-slate-500">
              Positive: <strong className="text-emerald-700">{posCount}</strong> | Negative:{' '}
              <strong className="text-slate-700">{negCount}</strong>
            </div>
          </div>

          {!hasGeneratedDataset && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Positive Examples (one per line)
                </label>
                <textarea
                  rows={4}
                  value={manualPos}
                  onChange={(e) => setManualPos(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Negative Examples (one per line)
                </label>
                <textarea
                  rows={4}
                  value={manualNeg}
                  onChange={(e) => setManualNeg(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5"
                />
              </div>
            </div>
          )}

          {/* Algorithm selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Inference Algorithm
            </label>
            <select
              disabled
              className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 cursor-not-allowed"
            >
              <option>RPNI (Regular Positive & Negative Inference)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Standard state-merging with negative constraint verification.
            </p>
          </div>

          {/* Minimization Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="min-toggle"
              checked={minimize}
              onChange={(e) => setMinimize(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
            />
            <label htmlFor="min-toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
              Minimize DFA result (Hopcroft's algorithm)
            </label>
          </div>

          <button
            onClick={handleLearn}
            disabled={learning || posCount === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{learning ? 'Inferring Automaton...' : 'Learn DFA from Evidence'}</span>
          </button>
        </div>

        {/* Results & Verification Card */}
        <div className="lg:col-span-2 space-y-6">
          {learning ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-xs">
              <LoadingState message="Constructing Prefix Tree Acceptor and running RPNI state merging..." />
            </div>
          ) : inferredAutomaton ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Automaton Inferred Successfully
                  </h3>
                  <p className="text-xs text-slate-500">
                    Algorithm: {inferredAutomaton.algorithm?.name} (
                    {inferredAutomaton.algorithm?.variant})
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/inspector')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Open in Inspector</span>
                  </button>
                  <button
                    onClick={() => navigate('/simulator')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Simulate Strings</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Inferred States
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {inferredAutomaton.state_counts?.inferred_states}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Minimized States
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {inferredAutomaton.state_counts?.minimized_states}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Train Consistency
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatMetric(inferredAutomaton.training_consistency, true)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Completed Machine
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    {inferredAutomaton.automaton?.is_complete ? 'Total (Sink Added)' : 'Partial'}
                  </span>
                </div>
              </div>

              {/* Warnings */}
              {inferredAutomaton.warnings && inferredAutomaton.warnings.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Inference Notices:</span>
                  </div>
                  {inferredAutomaton.warnings.map((w, idx) => (
                    <p key={idx} className="pl-5 list-disc">
                      • {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Scientific Note */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Scientific Foundation: </span>
                {inferredAutomaton.scientific_note}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-xs">
              Click "Learn DFA from Evidence" to trigger real RPNI prefix tree construction and state merging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

