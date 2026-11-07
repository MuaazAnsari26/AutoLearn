import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  FastForward,
} from 'lucide-react';

export default function SimulationControls({
  isPlaying,
  currentStepIndex,
  totalSteps,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  speed,
  onSpeedChange,
  disabled = false,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
      {/* Step Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={disabled || currentStepIndex === -1}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
          title="Reset to start state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onPrevious}
          disabled={disabled || currentStepIndex <= 0}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
          title="Step backward"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            disabled={disabled}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={disabled || (currentStepIndex >= totalSteps - 1 && totalSteps > 0)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>Play</span>
          </button>
        )}

        <button
          onClick={onNext}
          disabled={disabled || currentStepIndex >= totalSteps - 1}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
          title="Step forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Speed */}
      <div className="flex items-center gap-6 text-xs text-slate-600">
        <div>
          Step{' '}
          <span className="font-mono font-bold text-slate-900">
            {currentStepIndex + 1}
          </span>{' '}
          of{' '}
          <span className="font-mono font-bold text-slate-900">{totalSteps}</span>
        </div>

        <div className="flex items-center gap-2">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          <span>Speed:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          >
            <option value={1500}>0.5x (Slow)</option>
            <option value={800}>1.0x (Normal)</option>
            <option value={400}>2.0x (Fast)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

