import React from 'react';
import { Download, FileSpreadsheet, FileJson, CheckCircle2, XCircle } from 'lucide-react';
import { formatMetric } from '../../utils/formatters';

export default function ExperimentResultsTable({ experimentData }) {
  if (!experimentData || !experimentData.results || experimentData.results.length === 0) {
    return null;
  }

  const { experiment_type, results, summary, scientific_insight, sample_disagreements } =
    experimentData;

  const handleExportCSV = () => {
    if (!results || results.length === 0) return;
    const keys = Object.keys(results[0]);
    const header = keys.join(',') + '\n';
    const rows = results
      .map((row) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(','))
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${experiment_type}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(experimentData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${experiment_type}_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Measured Raw Data</h3>
          <p className="text-xs text-slate-500">
            Actual metrics computed from genuine learner runs without fabrication.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-sans">
            <tr>
              {experiment_type === 'training_size' && (
                <>
                  <th className="px-4 py-2.5">Sample Size (N)</th>
                  <th className="px-4 py-2.5">Pos / Neg</th>
                  <th className="px-4 py-2.5">Train Consistency</th>
                  <th className="px-4 py-2.5">Test Accuracy</th>
                  <th className="px-4 py-2.5">Test F1</th>
                  <th className="px-4 py-2.5">Minimized States</th>
                  <th className="px-4 py-2.5">Exact Equivalence</th>
                  <th className="px-4 py-2.5">Runtime (ms)</th>
                </>
              )}
              {experiment_type === 'diversity' && (
                <>
                  <th className="px-4 py-2.5">Strategy</th>
                  <th className="px-4 py-2.5">Sample Size</th>
                  <th className="px-4 py-2.5">Lengths</th>
                  <th className="px-4 py-2.5">Test Accuracy</th>
                  <th className="px-4 py-2.5">Test F1</th>
                  <th className="px-4 py-2.5">States</th>
                  <th className="px-4 py-2.5">Runtime (ms)</th>
                </>
              )}
              {experiment_type === 'noise' && (
                <>
                  <th className="px-4 py-2.5">Noise Rate</th>
                  <th className="px-4 py-2.5">Flipped Labels</th>
                  <th className="px-4 py-2.5">Train Consistency</th>
                  <th className="px-4 py-2.5">Clean Test Accuracy</th>
                  <th className="px-4 py-2.5">States</th>
                  <th className="px-4 py-2.5">Runtime (ms)</th>
                </>
              )}
              {experiment_type === 'insufficient_data' && (
                <>
                  <th className="px-4 py-2.5">Length Partition</th>
                  <th className="px-4 py-2.5">Test Count</th>
                  <th className="px-4 py-2.5">Accuracy</th>
                  <th className="px-4 py-2.5">F1</th>
                  <th className="px-4 py-2.5">False Positives</th>
                  <th className="px-4 py-2.5">False Negatives</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {experiment_type === 'insufficient_data'
              ? (experimentData.length_bucket_evaluations || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-sans font-medium text-slate-800">
                      {row.bucket_name}
                    </td>
                    <td className="px-4 py-2.5">{row.sample_count}</td>
                    <td className="px-4 py-2.5 font-bold text-blue-600">
                      {formatMetric(row.accuracy, true)}
                    </td>
                    <td className="px-4 py-2.5">{formatMetric(row.f1, true)}</td>
                    <td className="px-4 py-2.5 text-rose-600">{row.false_positives}</td>
                    <td className="px-4 py-2.5 text-rose-600">{row.false_negatives}</td>
                  </tr>
                ))
              : results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {experiment_type === 'training_size' && (
                      <>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{row.training_size}</td>
                        <td className="px-4 py-2.5">{row.positive_count} / {row.negative_count}</td>
                        <td className="px-4 py-2.5">{formatMetric(row.training_consistency, true)}</td>
                        <td className="px-4 py-2.5 font-bold text-blue-600">{formatMetric(row.test_accuracy, true)}</td>
                        <td className="px-4 py-2.5">{formatMetric(row.test_f1, true)}</td>
                        <td className="px-4 py-2.5">{row.minimized_states}</td>
                        <td className="px-4 py-2.5 font-sans">
                          {row.is_equivalent_to_reference ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Equivalent
                            </span>
                          ) : (
                            <span className="text-slate-400">Inequivalent</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{row.runtime_ms} ms</td>
                      </>
                    )}
                    {experiment_type === 'diversity' && (
                      <>
                        <td className="px-4 py-2.5 font-sans font-medium text-slate-800">{row.strategy_name}</td>
                        <td className="px-4 py-2.5">{row.sample_count}</td>
                        <td className="px-4 py-2.5">{row.distinct_lengths}</td>
                        <td className="px-4 py-2.5 font-bold text-blue-600">{formatMetric(row.test_accuracy, true)}</td>
                        <td className="px-4 py-2.5">{formatMetric(row.test_f1, true)}</td>
                        <td className="px-4 py-2.5">{row.inferred_states}</td>
                        <td className="px-4 py-2.5">{row.runtime_ms} ms</td>
                      </>
                    )}
                    {experiment_type === 'noise' && (
                      <>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{row.noise_percentage}</td>
                        <td className="px-4 py-2.5">{row.flipped_count}</td>
                        <td className="px-4 py-2.5">{formatMetric(row.training_consistency, true)}</td>
                        <td className="px-4 py-2.5 font-bold text-blue-600">{formatMetric(row.test_accuracy, true)}</td>
                        <td className="px-4 py-2.5">{row.inferred_states}</td>
                        <td className="px-4 py-2.5">{row.runtime_ms} ms</td>
                      </>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Insufficient Data Disagreements */}
      {sample_disagreements && sample_disagreements.length > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <div className="font-semibold text-slate-900">
            Disagreements with Reference Machine on Unseen Strings:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
            {sample_disagreements.slice(0, 6).map((d, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>w = '{d.string}' (|w|={d.length})</span>
                <span className="text-slate-500">
                  Learned: <strong className="text-blue-600">{d.learned_prediction}</strong> vs Ref:{' '}
                  <strong className="text-slate-900">{d.reference_label}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Insight */}
      {scientific_insight && (
        <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Scientific Analysis: </span>
          {scientific_insight}
        </div>
      )}
    </div>
  );
}

