import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Network, Layers } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import StringTester from '../components/simulator/StringTester';
import SimulationControls from '../components/simulator/SimulationControls';
import ExecutionPath from '../components/simulator/ExecutionPath';
import AutomatonGraph from '../components/automaton/AutomatonGraph';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import api from '../services/api';

export default function SimulatorPage() {
  const { inferredAutomaton, referenceAutomaton, addSimulation } = useWorkspace();

  const [activeModel, setActiveModel] = useState('inferred'); // 'inferred' or 'reference'
  const [simulation, setSimulation] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  const targetAutomaton =
    activeModel === 'inferred'
      ? inferredAutomaton?.automaton
      : referenceAutomaton;

  const handleSimulate = async (inputString) => {
    if (!targetAutomaton) {
      setError('No active automaton model to simulate against.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await api.simulateAutomaton({
        automaton: targetAutomaton,
        input_string: inputString,
      });
      setSimulation(res);
      setCurrentStepIndex(res.steps.length > 0 ? 0 : -1);
      addSimulation(res);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Playback timer
  useEffect(() => {
    if (isPlaying && simulation && simulation.steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulation.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, simulation, speed]);

  // Compute graph highlighting state from simulation and current step
  const simulationHighlightState = (() => {
    if (!simulation) {
      return { currentState: targetAutomaton?.start_state || null };
    }

    if (currentStepIndex === -1) {
      return { currentState: simulation.start_state };
    }

    const currentStep = simulation.steps[currentStepIndex];
    if (!currentStep) return null;

    if (simulation.type === 'NFA') {
      return {
        activeStates: currentStep.to_states || [],
        activeEdgeKey: `${currentStep.from_states?.join(',')}-${currentStep.symbol}-${currentStep.to_states?.join(',')}`,
      };
    }

    return {
      currentState: currentStep.to_state,
      activeEdgeKey: `${currentStep.from_state}->${currentStep.to_state}`,
    };
  })();

  if (!inferredAutomaton && !referenceAutomaton) {
    return (
      <EmptyState
        title="No Automaton to Simulate"
        description="Learn an automaton or select a language to test input strings."
        actionLabel="Go to Learning"
        onAction={() => (window.location.href = '/learn')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Interactive String Simulator</h1>
          <p className="text-xs text-slate-500">
            Step through state transitions and observe acceptance or rejection.
          </p>
        </div>

        {referenceAutomaton && inferredAutomaton && (
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => {
                setActiveModel('inferred');
                setSimulation(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeModel === 'inferred'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulate Inferred DFA
            </button>
            <button
              onClick={() => {
                setActiveModel('reference');
                setSimulation(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeModel === 'reference'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulate Reference DFA
            </button>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input and Trace */}
        <div className="space-y-4 lg:col-span-1">
          <StringTester
            onSimulate={handleSimulate}
            alphabet={targetAutomaton?.alphabet || ['0', '1']}
            loading={loading}
          />

          <ExecutionPath simulation={simulation} currentStepIndex={currentStepIndex} />
        </div>

        {/* Right Column: Interactive Graph & Step Controls */}
        <div className="space-y-4 lg:col-span-2">
          <SimulationControls
            isPlaying={isPlaying}
            currentStepIndex={currentStepIndex}
            totalSteps={simulation?.steps?.length || 0}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onNext={() => setCurrentStepIndex((prev) => Math.min(prev + 1, (simulation?.steps?.length || 1) - 1))}
            onPrevious={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
            onReset={() => {
              setIsPlaying(false);
              setCurrentStepIndex(-1);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            disabled={!simulation}
          />

          <AutomatonGraph
            automaton={targetAutomaton}
            simulationState={simulationHighlightState}
            title={activeModel === 'inferred' ? 'Inferred Automaton (Live Step)' : 'Reference Model (Live Step)'}
            badge={activeModel === 'inferred' ? 'Inferred' : 'Reference'}
            className="h-[460px]"
          />
        </div>
      </div>
    </div>
  );
}

