import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import ExperimentControls from '../components/experiments/ExperimentControls';
import ExperimentChart from '../components/experiments/ExperimentChart';
import ExperimentResultsTable from '../components/experiments/ExperimentResultsTable';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingState from '../components/common/LoadingState';
import api from '../services/api';

export default function ExperimentsPage() {
  const [selectedType, setSelectedType] = useState('training_size');
  const [seed, setSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [experimentData, setExperimentData] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;
      if (selectedType === 'training_size') {
        data = await api.runTrainingSizeExperiment({ seed });
      } else if (selectedType === 'diversity') {
        data = await api.runDiversityExperiment({ seed });
      } else if (selectedType === 'noise') {
        data = await api.runNoiseExperiment({ seed });
      } else if (selectedType === 'insufficient_data') {
        data = await api.runInsufficientDataExperiment({ seed });
      }
      setExperimentData(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Experiment execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Empirical Experiments Studio</h1>
        <p className="text-xs text-slate-500">
          Run reproducible scientific experiments investigating sample size, data diversity, label noise, and length generalization.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <ExperimentControls
        selectedType={selectedType}
        onSelectType={(type) => {
          setSelectedType(type);
          setExperimentData(null);
        }}
        seed={seed}
        onSeedChange={setSeed}
        onRun={handleRun}
        loading={loading}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-xs">
          <LoadingState message="Running learners across schedules and computing independent test evaluations..." />
        </div>
      ) : (
        experimentData && (
          <div className="space-y-6">
            <ExperimentChart experimentData={experimentData} />
            <ExperimentResultsTable experimentData={experimentData} />
          </div>
        )
      )}
    </div>
  );
}

