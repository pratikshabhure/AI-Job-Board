import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './hooks/useUser';

// Auth Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageJobs from './pages/admin/ManageJobs';
import JobForm from './pages/admin/JobForm';
import JobApplications from './pages/admin/JobApplications';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import BrowseJobs from './pages/candidate/BrowseJobs';
import AIMatch from './pages/candidate/AIMatch';
import MyApplications from './pages/candidate/MyApplications';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs" element={
        <ProtectedRoute requiredRole="admin">
          <ManageJobs />
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs/new" element={
        <ProtectedRoute requiredRole="admin">
          <JobForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs/:id/edit" element={
        <ProtectedRoute requiredRole="admin">
          <JobForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs/:id/applications" element={
        <ProtectedRoute requiredRole="admin">
          <JobApplications />
        </ProtectedRoute>
      } />
      
      {/* Candidate Routes */}
      <Route path="/candidate/dashboard" element={
        <ProtectedRoute requiredRole="candidate">
          <CandidateDashboard />
        </ProtectedRoute>
      } />
      <Route path="/candidate/profile" element={
        <ProtectedRoute requiredRole="candidate">
          <CandidateProfile />
        </ProtectedRoute>
      } />
      <Route path="/candidate/jobs" element={
        <ProtectedRoute requiredRole="candidate">
          <BrowseJobs />
        </ProtectedRoute>
      } />
      <Route path="/candidate/ai-match" element={
        <ProtectedRoute requiredRole="candidate">
          <AIMatch />
        </ProtectedRoute>
      } />
      <Route path="/candidate/applications" element={
        <ProtectedRoute requiredRole="candidate">
          <MyApplications />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;