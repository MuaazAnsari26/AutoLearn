import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
}) {
  const { symbols, isSelfLoop, isBiDirectional, isTraversed } = data || {};

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isSelfLoop) {
    // Custom SVG loop path above the state
    const radius = 28;
    edgePath = `M ${sourceX - 10} ${sourceY - 20} C ${sourceX - 25} ${sourceY - 60}, ${sourceX + 25} ${sourceY - 60}, ${sourceX + 10} ${sourceY - 20}`;
    labelX = sourceX;
    labelY = sourceY - 55;
  } else {
    // Bezier curve with curvature for bidirectional edges
    const curvature = isBiDirectional ? 0.35 : 0.15;
    const [path, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  }

  const strokeColor = isTraversed ? '#2563eb' : '#64748b';
  const strokeWidth = isTraversed ? 2.5 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-1.5 py-0.5 rounded text-[11px] font-bold shadow-xs select-none ${
            isTraversed
              ? 'bg-blue-600 text-white ring-2 ring-blue-300'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          {symbols}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

