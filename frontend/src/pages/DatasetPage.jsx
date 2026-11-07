import React from 'react';
import { useDataset } from '../hooks/useDataset';
import DatasetForm from '../components/dataset/DatasetForm';
import DatasetSummary from '../components/dataset/DatasetSummary';
import DatasetTable from '../components/dataset/DatasetTable';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';

export default function DatasetPage() {
  const { dataset, loading, error, generate, updateSamples } = useDataset();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dataset Generator & Editor</h1>
          <p className="text-xs text-slate-500">
            Generate, customize, and inspect labeled strings for training the automata learner.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <DatasetForm onGenerate={generate} loading={loading} />
        </div>

        {/* Dataset Summary & Table */}
        <div className="lg:col-span-2 space-y-6">
          {dataset?.summary && (
            <DatasetSummary summary={dataset.summary} metadata={dataset.metadata} />
          )}

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
              <LoadingState message="Generating balanced dataset with reproducible seed..." />
            </div>
          ) : dataset?.samples && dataset.samples.length > 0 ? (
            <DatasetTable
              samples={dataset.samples}
              onUpdateSamples={updateSamples}
              alphabet={dataset.metadata?.alphabet || ['0', '1']}
            />
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-xs">
              Configure parameters on the left and click "Generate Labeled Dataset" to create training data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

