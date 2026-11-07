import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function ExperimentChart({ experimentData }) {
  if (!experimentData || !experimentData.results || experimentData.results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
        Run an experiment to visualize empirical performance metrics.
      </div>
    );
  }

  const { experiment_type, results } = experimentData;

  // Chart configuration depending on experiment type
  if (experiment_type === 'training_size') {
    const chartData = results.map((r) => ({
      name: `N=${r.training_size}`,
      'Test Accuracy': r.test_accuracy !== null ? Math.round(r.test_accuracy * 100) : 0,
      'Test F1': r.test_f1 !== null ? Math.round(r.test_f1 * 100) : 0,
      'Train Consistency': r.training_consistency !== null ? Math.round(r.training_consistency * 100) : 100,
      States: r.minimized_states || 0,
    }));

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Training Size vs. Generalization & Complexity
          </h3>
          <p className="text-xs text-slate-500">
            Metrics evaluated on an independent clean test set.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'States' ? value : `${value}%`, name]} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="Test Accuracy" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="Test F1" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
              <Line yAxisId="left" type="monotone" dataKey="Train Consistency" stroke="#8b5cf6" strokeWidth={1.5} />
              <Line yAxisId="right" type="monotone" dataKey="States" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (experiment_type === 'diversity') {
    const chartData = results.map((r) => ({
      name: r.strategy_name?.replace('Narrow Lengths (0–3)', 'Narrow')
        ?.replace('Imbalanced (80% Pos)', '80% Pos')
        ?.replace('Imbalanced (20% Pos)', '20% Pos')
        ?.replace('Balanced & Broad (0–8)', 'Balanced'),
      'Test Accuracy': r.test_accuracy !== null ? Math.round(r.test_accuracy * 100) : 0,
      'Inferred States': r.inferred_states || 0,
    }));

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Data Composition Strategy vs. Generalization
          </h3>
          <p className="text-xs text-slate-500">
            Comparing narrow vs broad length coverage and class balances.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Test Accuracy']} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Test Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (experiment_type === 'noise') {
    const chartData = results.map((r) => ({
      name: r.noise_percentage,
      'Test Accuracy': r.test_accuracy !== null ? Math.round(r.test_accuracy * 100) : 0,
      'Test F1': r.test_f1 !== null ? Math.round(r.test_f1 * 100) : 0,
      States: r.inferred_states || 0,
    }));

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Label Noise Rate vs. Model Accuracy
          </h3>
          <p className="text-xs text-slate-500">
            Test set labels remain clean; noise applied only to training labels.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'States' ? value : `${value}%`, name]} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="Test Accuracy" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="Test F1" stroke="#f59e0b" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="States" stroke="#64748b" strokeWidth={1.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (experiment_type === 'insufficient_data') {
    const chartData = (experimentData.length_bucket_evaluations || []).map((b) => ({
      name: b.bucket_name.split('(')[0].trim(),
      Accuracy: Math.round(b.accuracy * 100),
      'False Positives': b.false_positives,
      'False Negatives': b.false_negatives,
    }));

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Length Extrapolation: Accuracy by String Length Partition
          </h3>
          <p className="text-xs text-slate-500">
            Trained on short strings (0–3), evaluated on unseen medium and long strings.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'Accuracy' ? `${value}%` : value, name]} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}

