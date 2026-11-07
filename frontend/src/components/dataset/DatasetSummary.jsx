import React from 'react';
import { Database, CheckCircle, XCircle, BarChart3, Shuffle } from 'lucide-react';
import MetricCard from '../common/MetricCard';

export default function DatasetSummary({ summary, metadata }) {
  if (!summary) return null;

  const {
    total_samples = 0,
    positive_count = 0,
    negative_count = 0,
    positive_ratio = 0,
    unique_strings = 0,
    unique_ratio = 0,
    distinct_lengths = 0,
    min_length = 0,
    max_length = 0,
    symbol_frequencies = {},
    actual_noise_rate = 0,
    noisy_flips_count = 0,
  } = summary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total Samples"
          value={total_samples}
          subtitle={`Lengths ${min_length} to ${max_length}`}
          icon={Database}
          color="blue"
        />
        <MetricCard
          title="Positive (1)"
          value={positive_count}
          subtitle={`${Math.round(positive_ratio * 100)}% of dataset`}
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Negative (0)"
          value={negative_count}
          subtitle={`${Math.round((1 - positive_ratio) * 100)}% of dataset`}
          icon={XCircle}
          color="slate"
        />
        <MetricCard
          title="Unique Ratio"
          value={`${Math.round(unique_ratio * 100)}%`}
          subtitle={`${unique_strings} distinct strings`}
          icon={BarChart3}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-semibold text-slate-800">Diversity & Composition Profile</span>
          {metadata?.seed !== undefined && (
            <span className="text-slate-500 font-mono">Seed: {metadata.seed}</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
          <div>
            <span className="block text-slate-400">Distinct Lengths:</span>
            <span className="font-semibold text-slate-900 text-sm">{distinct_lengths}</span>
          </div>

          <div>
            <span className="block text-slate-400">Alphabet Frequencies:</span>
            <div className="flex gap-2 font-mono font-medium text-slate-900 mt-0.5">
              {Object.entries(symbol_frequencies).map(([sym, count]) => (
                <span key={sym} className="bg-slate-100 px-1.5 py-0.5 rounded">
                  '{sym}': {count}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-slate-400">Label Noise:</span>
            <span
              className={`font-semibold text-sm ${
                actual_noise_rate > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {Math.round(actual_noise_rate * 100)}% ({noisy_flips_count} flips)
            </span>
          </div>

          <div>
            <span className="block text-slate-400">Target Rule:</span>
            <span className="font-medium text-slate-800 truncate block">
              {metadata?.language_name || 'Custom'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

