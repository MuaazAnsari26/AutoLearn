import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export default function StateNode({ data, selected }) {
  const { label, isStart, isAccept, isCurrent, isActive } = data;

  // Base state styles
  let borderStyle = 'border-2 border-slate-700 bg-white';
  let ringStyle = '';

  if (isCurrent || isActive) {
    borderStyle = 'border-2 border-blue-600 bg-blue-50 text-blue-900';
    ringStyle = 'ring-4 ring-blue-400/40 animate-pulse';
  } else if (selected) {
    borderStyle = 'border-2 border-slate-900 bg-slate-50';
    ringStyle = 'ring-2 ring-slate-400';
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Start State Indicator Arrow */}
      {isStart && (
        <div
          className="absolute -left-8 flex items-center text-blue-600 font-bold"
          title="Start State"
        >
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </div>
      )}

      {/* Target/Source handles for transitions */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />

      {/* Outer Circle (for accepting double border) */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${borderStyle} ${ringStyle} ${
          isAccept ? 'p-1' : ''
        }`}
      >
        {isAccept ? (
          /* Inner Circle for Accepting States */
          <div className="w-full h-full rounded-full border-2 border-slate-700 flex items-center justify-center font-semibold text-sm">
            {label}
          </div>
        ) : (
          <span className="font-semibold text-sm">{label}</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-1.5 h-1.5 bg-slate-400 opacity-0"
      />
    </div>
  );
}

