import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AppShell from './components/layout/AppShell';

import Dashboard from './pages/Dashboard';
import DatasetPage from './pages/DatasetPage';
import LearningPage from './pages/LearningPage';
import InspectorPage from './pages/InspectorPage';
import SimulatorPage from './pages/SimulatorPage';
import ExperimentsPage from './pages/ExperimentsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="dataset" element={<DatasetPage />} />
            <Route path="learn" element={<LearningPage />} />
            <Route path="inspector" element={<InspectorPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="experiments" element={<ExperimentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
