import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Languages & Datasets
  getLanguages: async () => {
    const res = await apiClient.get('/languages');
    return res.data;
  },

  generateDataset: async (params) => {
    const res = await apiClient.post('/datasets/generate', params);
    return res.data;
  },

  validateDataset: async (data) => {
    const res = await apiClient.post('/datasets/validate', data);
    return res.data;
  },

  // Automata & Learning
  learnAutomaton: async (params) => {
    const res = await apiClient.post('/automata/learn', params);
    return res.data;
  },

  simulateAutomaton: async (params) => {
    const res = await apiClient.post('/automata/simulate', params);
    return res.data;
  },

  minimizeDFA: async (dfa) => {
    const res = await apiClient.post('/automata/minimize', { dfa });
    return res.data;
  },

  checkEquivalence: async (dfa1, dfa2) => {
    const res = await apiClient.post('/automata/equivalence', { dfa1, dfa2 });
    return res.data;
  },

  getReferenceDFA: async (languageId) => {
    const res = await apiClient.get(`/automata/reference/${languageId}`);
    return res.data;
  },

  // Experiments
  runTrainingSizeExperiment: async (params) => {
    const res = await apiClient.post('/experiments/training-size', params);
    return res.data;
  },

  runDiversityExperiment: async (params) => {
    const res = await apiClient.post('/experiments/diversity', params);
    return res.data;
  },

  runNoiseExperiment: async (params) => {
    const res = await apiClient.post('/experiments/noise', params);
    return res.data;
  },

  runInsufficientDataExperiment: async (params) => {
    const res = await apiClient.post('/experiments/insufficient-data', params);
    return res.data;
  },
};

export default api;

