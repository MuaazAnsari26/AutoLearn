import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { validateInputString } from '../../utils/validation';

export default function StringTester({ onSimulate, alphabet = ['0', '1'], loading }) {
  const [inputString, setInputString] = useState('101');
  const [error, setError] = useState('');

  const quickSamples = ['01', '101', '1101', '00', '111', ''];

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = validateInputString(inputString, alphabet);
    if (!val.isValid) {
      setError(val.error);
      return;
    }
    setError('');
    onSimulate(inputString);
  };

  const handleSelectQuick = (s) => {
    setInputString(s);
    setError('');
    onSimulate(s);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Test String Simulation</h3>
        <p className="text-xs text-slate-500">
          Enter any string over alphabet {'{' + alphabet.join(', ') + '}'} to simulate execution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputString}
            onChange={(e) => {
              setInputString(e.target.value);
              setError('');
            }}
            placeholder="e.g. 10101 (or leave empty for ε)"
            className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'Running...' : 'Simulate'}</span>
        </button>
      </form>

      {/* Quick Test Strings */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Quick examples:</span>
        {quickSamples.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectQuick(s)}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-mono transition-colors cursor-pointer"
          >
            {s === '' ? 'ε (empty)' : s}
          </button>
        ))}
      </div>
    </div>
  );
}

