import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import StateNode from './StateNode';
import TransitionEdge from './TransitionEdge';
import GraphLegend from './GraphLegend';
import { automatonToGraph } from '../../utils/automatonToGraph';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { transitionEdge: TransitionEdge };

const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: '#64748b',
  },
};

export default function AutomatonGraph({
  automaton,
  simulationState = null,
  title = 'Automaton Graph',
  badge = 'DFA',
  className = 'h-[500px]',
}) {
  const { nodes, edges } = useMemo(() => {
    return automatonToGraph(automaton, simulationState);
  }, [automaton, simulationState]);

  if (!automaton || !automaton.states || automaton.states.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-sm ${className}`}>
        No automaton to display. Generate a dataset and run automata learning first.
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs ${className}`}>
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-800/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
        <span className="font-semibold text-slate-200">{title}</span>
        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase">
          {badge}
        </span>
        <span className="text-slate-400">
          | {automaton.states.length} states, {Object.keys(automaton.transitions || {}).length} transitions
        </span>
      </div>

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 z-10 hidden sm:block">
        <GraphLegend />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-white border-slate-200 shadow-md rounded-lg text-slate-700" />
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-slate-800 border-slate-700 rounded-lg hidden md:block"
        />
      </ReactFlow>
    </div>
  );
}

