import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  BrainCircuit,
  Network,
  PlayCircle,
  FlaskConical,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import MetricCard from '../components/common/MetricCard';
import EmptyState from '../components/common/EmptyState';
import AutomatonGraph from '../components/automaton/AutomatonGraph';
import { formatMetric } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dataset,
    inferredAutomaton,
    referenceAutomaton,
    languages,
    activeLanguage,
    recentSimulations,
  } = useWorkspace();

  const currentLang = languages.find((l) => l.id === activeLanguage);

  const hasData = Boolean(dataset && dataset.samples && dataset.samples.length > 0);
  const hasLearned = Boolean(inferredAutomaton && inferredAutomaton.automaton);

  const sampleCount = dataset?.summary?.total_samples ?? null;
  const posCount = dataset?.summary?.positive_count ?? null;
  const negCount = dataset?.summary?.negative_count ?? null;

  const stateCount = inferredAutomaton?.automaton?.states?.length ?? null;
  const trainingConsistency = inferredAutomaton?.training_consistency ?? null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Automata Learning & Visualization
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Learn. Visualize. Understand.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            AutoLearn infers approximate deterministic finite-state automata from labeled
            positive and negative example strings using the RPNI state-merging algorithm.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/dataset')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Generate Dataset</span>
          </button>
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Learn Automaton</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Real Data Only) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Training Samples"
          value={sampleCount}
          subtitle={hasData ? `${posCount} pos / ${negCount} neg` : 'No dataset active'}
          icon={Database}
          color="blue"
        />
        <MetricCard
          title="Inferred States"
          value={stateCount}
          subtitle={hasLearned ? 'RPNI Candidate Model' : 'Awaiting inference'}
          icon={Layers}
          color="purple"
        />
        <MetricCard
          title="Train Consistency"
          value={trainingConsistency !== null ? formatMetric(trainingConsistency, true) : null}
          subtitle={hasLearned ? 'Accuracy on training examples' : 'Awaiting inference'}
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Target Language"
          value={currentLang ? currentLang.name : 'contains_01'}
          subtitle={currentLang?.alphabet ? `Σ = {${currentLang.alphabet.join(', ')}}` : 'Σ = {0, 1}'}
          icon={Network}
          color="slate"
        />
      </div>

      {/* Main Workspace Preview or Empty State */}
      {!hasData && !hasLearned ? (
        <EmptyState
          title="Fresh Workspace Ready"
          description="Start by choosing a built-in regular language and generating a labeled dataset, or enter positive and negative examples manually."
          actionLabel="Open Dataset Generator"
          onAction={() => navigate('/dataset')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Automaton Preview Canvas */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-600" />
                <span>Automaton Graph Preview</span>
              </h2>
              <button
                onClick={() => navigate('/inspector')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Full Inspector</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <AutomatonGraph
              automaton={inferredAutomaton?.automaton || referenceAutomaton}
              title={inferredAutomaton ? 'Latest Inferred DFA' : 'Reference Model'}
              badge={inferredAutomaton ? 'Inferred' : 'Reference'}
              className="h-[420px]"
            />
          </div>

          {/* Quick Actions & Recent Activity Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quick Navigation
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/dataset')}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Dataset Generator</div>
                      <div className="text-[11px] text-slate-500">Edit, import or generate strings</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/learn')}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BrainCircuit className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Learn Automaton</div>
                      <div className="text-[11px] text-slate-500">Run RPNI state merging</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/simulator')}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <PlayCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Simulator</div>
                      <div className="text-[11px] text-slate-500">Step-by-step string animation</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/experiments')}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Experiments</div>
                      <div className="text-[11px] text-slate-500">Study size, diversity & noise</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Scientific Note */}
            <div className="bg-slate-100/80 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800">Formal Limitation Note:</span>
              <p className="leading-relaxed">
                Finite training examples do not uniquely identify an unknown regular language.
                The learned DFA is an approximate hypothesis consistent with the provided samples.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

