import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const EXPERIMENT_TYPES = [
  {
    id: 'training_size',
    name: 'Experiment A: Training Size',
    description: 'Evaluate how training sample quantity affects generalization, state counts, and runtime.',
  },
  {
    id: 'diversity',
    name: 'Experiment B: Data Diversity',
    description: 'Compare narrow vs. broad length coverage and balanced vs. imbalanced samples.',
  },
  {
    id: 'noise',
    name: 'Experiment C: Label Noise',
    description: 'Examine model degradation under 0% to 30% corrupted training labels.',
  },
  {
    id: 'insufficient_data',
    name: 'Experiment D: Insufficient Data & Generalization',
    description: 'Demonstrate failure modes when extrapolating from short strings to long strings.',
  },
];

export default function ExperimentControls({
  selectedType,
  onSelectType,
  seed,
  onSeedChange,
  onRun,
  loading,
}) {
  const { languages, activeLanguage, setActiveLanguage } = useWorkspace();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Automata Learning Experiments</h2>
        <p className="text-xs text-slate-500">
          Run empirical studies using real RPNI inference and independent test evaluations.
        </p>
      </div>

      {/* Experiment Type Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXPERIMENT_TYPES.map((exp) => {
          const isSelected = selectedType === exp.id;
          return (
            <div
              key={exp.id}
              onClick={() => onSelectType(exp.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-blue-900' : 'text-slate-900'
                  }`}
                >
                  {exp.name}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {exp.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Target Regular Language
          </label>
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Random Seed (Reproducibility)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(Number(e.target.value))}
            className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
      >
        <Play className="w-4 h-4" />
        <span>{loading ? 'Running Real Learner Experiment...' : 'Run Experiment'}</span>
      </button>
    </div>
  );
}

