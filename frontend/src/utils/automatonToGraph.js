/**
 * Converts backend DFA/NFA JSON into React Flow nodes and edges with deterministic layout.
 */

export function automatonToGraph(automaton, simulationState = null) {
  if (!automaton || !automaton.states || automaton.states.length === 0) {
    return { nodes: [], edges: [] };
  }

  const {
    states = [],
    start_state = '',
    accept_states = [],
    transitions = {},
    type = 'DFA',
  } = automaton;

  const currentSimulationState = simulationState?.currentState || null;
  const currentActiveStates = new Set(simulationState?.activeStates || []);
  const activeEdgeKey = simulationState?.activeEdgeKey || null;

  // Compute layout coordinates (circle / layered layout)
  const numStates = states.length;
  const radius = Math.max(160, numStates * 45);
  const centerX = radius + 80;
  const centerY = radius + 80;

  // Sort states so start state is at angle Math.PI (left-most) or top
  const sortedStates = [...states].sort((a, b) => {
    if (a === start_state) return -1;
    if (b === start_state) return 1;
    return a.localeCompare(b);
  });

  const nodes = sortedStates.map((stateId, idx) => {
    // Position states around an ellipse/circle
    const angle = (2 * Math.PI * idx) / numStates - Math.PI;
    const x = Math.round(centerX + radius * 1.3 * Math.cos(angle));
    const y = Math.round(centerY + radius * Math.sin(angle));

    const isStart = stateId === start_state;
    const isAccept = accept_states.includes(stateId);
    const isCurrent = stateId === currentSimulationState;
    const isActive = currentActiveStates.has(stateId);

    return {
      id: stateId,
      type: 'stateNode',
      position: { x, y },
      data: {
        id: stateId,
        label: stateId,
        isStart,
        isAccept,
        isCurrent,
        isActive,
      },
    };
  });

  // Group transitions by (source, target) to avoid duplicate edges
  // transitions structure: { [source]: { [symbol]: target (or [targets] for NFA) } }
  const edgeGroups = new Map();

  Object.entries(transitions).forEach(([source, symbolMap]) => {
    if (!symbolMap || typeof symbolMap !== 'object') return;

    Object.entries(symbolMap).forEach(([symbol, targetOrTargets]) => {
      const targets = Array.isArray(targetOrTargets) ? targetOrTargets : [targetOrTargets];

      targets.forEach((target) => {
        if (!target) return;
        const key = `${source}->${target}`;
        if (!edgeGroups.has(key)) {
          edgeGroups.set(key, { source, target, symbols: [] });
        }
        edgeGroups.get(key).symbols.push(symbol);
      });
    });
  });

  const edges = [];
  edgeGroups.forEach(({ source, target, symbols }, key) => {
    const isSelfLoop = source === target;
    const isOppositePair = edgeGroups.has(`${target}->${source}`) && !isSelfLoop;
    const symbolsLabel = symbols.sort().join(', ');

    const isTraversed =
      activeEdgeKey &&
      (activeEdgeKey === key ||
        activeEdgeKey === `${source}-${symbols.join('/')}-${target}`);

    edges.push({
      id: `edge-${key}`,
      source,
      target,
      label: symbolsLabel,
      type: 'transitionEdge',
      animated: isTraversed,
      data: {
        symbols: symbolsLabel,
        isSelfLoop,
        isBiDirectional: isOppositePair,
        isTraversed,
      },
      style: {
        stroke: isTraversed ? '#2563eb' : '#64748b',
        strokeWidth: isTraversed ? 2.5 : 1.5,
      },
    });
  });

  return { nodes, edges };
}

