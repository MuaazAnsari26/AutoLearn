import React, { useState } from 'react';
import { Sparkles, Dices } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function DatasetForm({ onGenerate, loading }) {
  const { languages, activeLanguage, setActiveLanguage } = useWorkspace();

  const [sampleCount, setSampleCount] = useState(60);
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(8);
  const [positiveRatio, setPositiveRatio] = useState(0.5);
  const [noiseRate, setNoiseRate] = useState(0.0);
  const [seed, setSeed] = useState(42);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      language_id: activeLanguage,
      sample_count: Number(sampleCount),
      min_length: Number(minLength),
      max_length: Number(maxLength),
      positive_ratio: Number(positiveRatio),
      noise_rate: Number(noiseRate),
      seed: seed !== '' ? Number(seed) : undefined,
    });
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Dataset Generator</h2>
          <p className="text-xs text-slate-500">Generate labeled training strings for automata inference</p>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">
          Σ = {'{0, 1}'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language selector */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Target Regular Language
          </label>
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} — ({lang.description})
              </option>
            ))}
          </select>
        </div>

        {/* Sample Count */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Sample Count (N)
          </label>
          <input
            type="number"
            min={5}
            max={1000}
            value={sampleCount}
            onChange={(e) => setSampleCount(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Random Seed */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Random Seed (Reproducibility)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleRandomSeed}
              className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Generate random seed"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Min Length */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Min String Length
          </label>
          <input
            type="number"
            min={0}
            max={maxLength}
            value={minLength}
            onChange={(e) => setMinLength(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Max Length */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Max String Length
          </label>
          <input
            type="number"
            min={minLength}
            max={30}
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Positive Class Balance Ratio */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Positive Ratio</span>
            <span className="font-mono text-blue-600 font-semibold">{Math.round(positiveRatio * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={positiveRatio}
            onChange={(e) => setPositiveRatio(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Label Noise Rate */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Training Label Noise</span>
            <span className="font-mono text-amber-600 font-semibold">{Math.round(noiseRate * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.0}
            max={0.4}
            step={0.05}
            value={noiseRate}
            onChange={(e) => setNoiseRate(parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
      >
        <Sparkles className="w-4 h-4" />
        <span>{loading ? 'Generating...' : 'Generate Labeled Dataset'}</span>
      </button>
    </form>
  );
}

