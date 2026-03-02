import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TestCaseEditor from './pages/TestCaseEditor';
import ImportPage from './pages/ImportPage';
import TestRunPage from './pages/TestRunPage';
import UsersPage from './pages/UsersPage';

function RequireAuth({ children }) {
  const { token, user } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);

  useEffect(() => { if (token) dispatch(fetchMe()); }, [token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetail />} />
        <Route path="projects/:projectId/testcases/new" element={<TestCaseEditor />} />
        <Route path="projects/:projectId/testcases/:tcId/edit" element={<TestCaseEditor />} />
        <Route path="projects/:projectId/import" element={<ImportPage />} />
        <Route path="projects/:projectId/runs" element={<TestRunPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
