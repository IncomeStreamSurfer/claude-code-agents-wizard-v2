import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import './App.css';

/**
 * Root Application Component
 *
 * The main entry point for the Construction Cost Estimator application.
 * Sets up React Router for navigation between dashboard and project pages.
 *
 * Routes:
 * - `/` - Dashboard page (project list)
 * - `/project/:id` - Project detail/editor page
 *
 * Features:
 * - React Router for client-side navigation
 * - Dashboard for managing multiple projects
 * - Project editor with PDF viewer and annotation tools
 * - State persistence with Zustand
 * - Project-level data isolation
 *
 * Architecture:
 * - Dashboard page uses ProjectStore for project management
 * - ProjectDetail page uses both ProjectStore and AppStore
 * - ProjectStore: Manages multiple projects and their metadata
 * - AppStore: Manages current project's annotations, calibration, and costs
 *
 * Usage:
 * The app now supports multiple projects with a dashboard interface.
 * Users can:
 * 1. View all projects on the dashboard
 * 2. Create new projects by uploading PDFs
 * 3. Open a project to edit annotations and estimate costs
 * 4. Navigate back to dashboard to manage other projects
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard - Main landing page */}
        <Route path="/" element={<Dashboard />} />

        {/* Project Detail - Editor page */}
        <Route path="/project/:id" element={<ProjectDetail />} />

        {/* Fallback - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
