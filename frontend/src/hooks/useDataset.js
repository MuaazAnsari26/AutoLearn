import { useState } from 'react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export function useDataset() {
  const { dataset, setDataset, activeLanguage, setActiveLanguage } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateDataset({
        language_id: params.language_id || activeLanguage,
        sample_count: Number(params.sample_count) || 100,
        min_length: Number(params.min_length) || 0,
        max_length: Number(params.max_length) || 10,
        positive_ratio: Number(params.positive_ratio) ?? 0.5,
        noise_rate: Number(params.noise_rate) || 0.0,
        seed: params.seed !== undefined && params.seed !== '' ? Number(params.seed) : undefined,
      });
      setDataset(res);
      if (params.language_id && params.language_id !== activeLanguage) {
        setActiveLanguage(params.language_id);
      }
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Dataset generation failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSamples = (newSamples) => {
    if (!dataset) return;
    const pos = newSamples.filter((s) => s.label === 1).length;
    const neg = newSamples.filter((s) => s.label === 0).length;
    const total = newSamples.length;
    const unique = new Set(newSamples.map((s) => s.string)).size;
    const lengths = newSamples.map((s) => s.string.length);

    const updated = {
      ...dataset,
      samples: newSamples,
      summary: {
        ...dataset.summary,
        total_samples: total,
        positive_count: pos,
        negative_count: neg,
        positive_ratio: total > 0 ? Number((pos / total).toFixed(4)) : 0,
        unique_strings: unique,
        unique_ratio: total > 0 ? Number((unique / total).toFixed(4)) : 0,
        distinct_lengths: new Set(lengths).size,
      },
    };
    setDataset(updated);
  };

  return {
    dataset,
    loading,
    error,
    generate,
    updateSamples,
    setDataset,
  };
}

