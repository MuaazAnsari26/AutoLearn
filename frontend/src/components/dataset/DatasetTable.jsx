import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  AlertTriangle,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import ExampleEditor from './ExampleEditor';
import { exportToCSV, exportToJSON, parseCSV } from '../../utils/validation';
import { displayString } from '../../utils/formatters';

export default function DatasetTable({
  samples = [],
  onUpdateSamples,
  alphabet = ['0', '1'],
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, positive, negative, noisy, conflicting
  const [sortBy, setSortBy] = useState('default'); // default, length_asc, length_desc, label
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null);

  const fileInputRef = useRef(null);

  // Detect conflicts: strings that appear with both label 1 and label 0
  const conflictStrings = useMemo(() => {
    const pos = new Set();
    const neg = new Set();
    samples.forEach((s) => {
      if (s.label === 1) pos.add(s.string);
      if (s.label === 0) neg.add(s.string);
    });
    return new Set([...pos].filter((x) => neg.has(x)));
  }, [samples]);

  // Filter and sort
  const filteredSamples = useMemo(() => {
    return samples
      .filter((s) => {
        if (search && !s.string.includes(search)) return false;
        if (filterType === 'positive') return s.label === 1;
        if (filterType === 'negative') return s.label === 0;
        if (filterType === 'noisy') return s.is_noisy;
        if (filterType === 'conflicting') return conflictStrings.has(s.string);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'length_asc') return a.string.length - b.string.length;
        if (sortBy === 'length_desc') return b.string.length - a.string.length;
        if (sortBy === 'label') return b.label - a.label;
        return 0;
      });
  }, [samples, search, filterType, sortBy, conflictStrings]);

  const handleDelete = (id) => {
    onUpdateSamples(samples.filter((s) => s.id !== id));
  };

  const handleSave = (sampleData) => {
    if (editingSample) {
      onUpdateSamples(
        samples.map((s) => (s.id === editingSample.id ? { ...s, ...sampleData } : s))
      );
    } else {
      onUpdateSamples([sampleData, ...samples]);
    }
    setEditorOpen(false);
    setEditingSample(null);
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(samples);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autolearn_dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonContent = exportToJSON(samples);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autolearn_dataset.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        let imported = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : parsed.samples || [];
        } else {
          imported = parseCSV(text);
        }
        onUpdateSamples([...imported, ...samples]);
      } catch (err) {
        alert(`Failed to import file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
      {/* Conflict banner */}
      {conflictStrings.size > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Warning:</strong> {conflictStrings.size} contradictory string(s) have both Positive and Negative labels. Learning will fail until resolved.
          </span>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by string..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700"
          >
            <option value="all">All Labels ({samples.length})</option>
            <option value="positive">Positive Only</option>
            <option value="negative">Negative Only</option>
            <option value="noisy">Noisy Flipped Only</option>
            {conflictStrings.size > 0 && (
              <option value="conflicting">Conflicting Only ({conflictStrings.size})</option>
            )}
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700"
          >
            <option value="default">Default Order</option>
            <option value="length_asc">Length: Shortest</option>
            <option value="length_desc">Length: Longest</option>
            <option value="label">Label: Positive First</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            title="Import CSV or JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            title="Export JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={() => {
              setEditingSample(null);
              setEditorOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Example</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">String w</th>
              <th className="px-4 py-2.5">|w|</th>
              <th className="px-4 py-2.5">Label</th>
              <th className="px-4 py-2.5">Noise / True</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans">
                  No examples match the current filter.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample, idx) => {
                const isConflict = conflictStrings.has(sample.string);
                return (
                  <tr
                    key={sample.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isConflict ? 'bg-red-50/60' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-slate-400 font-sans">{idx + 1}</td>
                    <td className="px-4 py-2 font-bold text-slate-900">
                      {displayString(sample.string)}
                      {isConflict && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-sans font-medium">
                          Conflict!
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-500 font-sans">{sample.string.length}</td>
                    <td className="px-4 py-2 font-sans">
                      {sample.label === 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Positive (1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Negative (0)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-sans text-xs">
                      {sample.is_noisy ? (
                        <span className="text-amber-600 font-medium">
                          Flipped (True: {sample.true_label})
                        </span>
                      ) : (
                        <span className="text-slate-400">Clean</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingSample(sample);
                            setEditorOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sample.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ExampleEditor
        isOpen={editorOpen}
        initialSample={editingSample}
        alphabet={alphabet}
        onSave={handleSave}
        onCancel={() => {
          setEditorOpen(false);
          setEditingSample(null);
        }}
      />
    </div>
  );
}

