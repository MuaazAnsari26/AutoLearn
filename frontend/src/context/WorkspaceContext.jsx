import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [activeLanguage, setActiveLanguage] = useState('contains_01');
  const [languages, setLanguages] = useState([]);
  const [dataset, setDataset] = useState(null);
  const [inferredAutomaton, setInferredAutomaton] = useState(null);
  const [referenceAutomaton, setReferenceAutomaton] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const [recentSimulations, setRecentSimulations] = useState([]);

  // Load languages and health on start
  useEffect(() => {
    async function init() {
      try {
        const health = await api.checkHealth();
        if (health.status === 'ok') {
          setBackendConnected(true);
        }
        const langs = await api.getLanguages();
        setLanguages(langs);
      } catch (err) {
        console.error('Failed connecting to backend:', err);
        setBackendConnected(false);
      } finally {
        setIsCheckingHealth(false);
      }
    }
    init();

    const interval = setInterval(async () => {
      try {
        await api.checkHealth();
        setBackendConnected(true);
      } catch {
        setBackendConnected(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Fetch reference DFA when active language changes
  useEffect(() => {
    if (!activeLanguage) return;
    api
      .getReferenceDFA(activeLanguage)
      .then((data) => {
        setReferenceAutomaton(data.automaton);
      })
      .catch((err) => {
        console.warn('Could not fetch reference DFA:', err);
      });
  }, [activeLanguage]);

  const resetWorkspace = () => {
    setDataset(null);
    setInferredAutomaton(null);
    setRecentSimulations([]);
  };

  const addSimulation = (sim) => {
    setRecentSimulations((prev) => [sim, ...prev.slice(0, 9)]);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeLanguage,
        setActiveLanguage,
        languages,
        dataset,
        setDataset,
        inferredAutomaton,
        setInferredAutomaton,
        referenceAutomaton,
        backendConnected,
        isCheckingHealth,
        recentSimulations,
        addSimulation,
        resetWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

