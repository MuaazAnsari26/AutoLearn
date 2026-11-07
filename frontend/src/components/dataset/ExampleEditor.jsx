import React, { useState } from 'react';
import { validateInputString } from '../../utils/validation';

export default function ExampleEditor({
  isOpen,
  initialSample = null,
  alphabet = ['0', '1'],
  onSave,
  onCancel,
}) {
  const [stringVal, setStringVal] = useState(initialSample ? initialSample.string : '');
  const [label, setLabel] = useState(initialSample ? initialSample.label : 1);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const valCheck = validateInputString(stringVal, alphabet);
    if (!valCheck.isValid) {
      setError(valCheck.error);
      return;
    }

    onSave({
      id: initialSample?.id || `manual-${Date.now()}`,
      string: stringVal,
      label: Number(label),
      true_label: Number(label),
      source: 'manual',
      is_noisy: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          {initialSample ? 'Edit Example' : 'Add Manual Example'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              String (enter characters from {'{' + alphabet.join(', ') + '}'}; empty for ε)
            </label>
            <input
              type="text"
              value={stringVal}
              onChange={(e) => {
                setStringVal(e.target.value);
                setError('');
              }}
              placeholder="e.g. 0101 (or leave empty for ε)"
              className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Label (Class)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLabel(1)}
                className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                  label === 1
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Positive (1 / Accept)
              </button>
              <button
                type="button"
                onClick={() => setLabel(0)}
                className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                  label === 0
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Negative (0 / Reject)
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
            >
              Save Example
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

