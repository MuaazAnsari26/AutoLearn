import { useState } from 'react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export function useAutomaton() {
  const { inferredAutomaton, setInferredAutomaton, referenceAutomaton } = useWorkspace();
  const [learning, setLearning] = useState(false);
  const [error, setError] = useState(null);

  const learn = async ({ positiveExamples, negativeExamples, alphabet = ['0', '1'], minimize = true }) => {
    setLearning(true);
    setError(null);
    try {
      const res = await api.learnAutomaton({
        positive_examples: positiveExamples,
        negative_examples: negativeExamples,
        alphabet,
        minimize_result: minimize,
      });
      setInferredAutomaton(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Learning failed';
      setError(msg);
      throw err;
    } finally {
      setLearning(false);
    }
  };

  return {
    inferredAutomaton,
    referenceAutomaton,
    learning,
    error,
    learn,
    setInferredAutomaton,
  };
}

