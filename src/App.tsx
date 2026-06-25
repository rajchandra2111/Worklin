import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ForClients } from './pages/ForClients';
import { ForFreelancers } from './pages/ForFreelancers';
import { useEffect } from 'react';
import { useUiStore } from './store/uiStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ClientDashboard } from './pages/dashboard/ClientDashboard';
import { FreelancerDashboard } from './pages/dashboard/FreelancerDashboard';
import { Onboarding } from './pages/dashboard/Onboarding';
import { PostProject } from './pages/dashboard/PostProject';
import { BrowseProjects } from './pages/dashboard/BrowseProjects';
import { ProjectDetails } from './pages/dashboard/ProjectDetails';

// Simple wrapper components that just trigger the modal and redirect to home
function LoginRedirect() {
  const { openAuthModal } = useUiStore();
  useEffect(() => {
    openAuthModal('login');
  }, [openAuthModal]);
  return <Navigate to="/" replace />;
}

function SignupRedirect() {
  const { openAuthModal } = useUiStore();
  useEffect(() => {
    openAuthModal('signup');
  }, [openAuthModal]);
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="for-clients" element={<ForClients />} />
          <Route path="for-freelancers" element={<ForFreelancers />} />
          <Route path="login" element={<LoginRedirect />} />
          <Route path="signup" element={<SignupRedirect />} />
          <Route path="browse" element={<Navigate to="/#browse-freelancers" replace />} />
        </Route>

        <Route path="/onboarding" element={<Onboarding />} />

        {/* Client Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/client" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="post-project" element={<PostProject />} />
            <Route path="*" element={<div className="p-8">Page under construction</div>} />
          </Route>
        </Route>

        {/* Freelancer Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
          <Route path="/freelancer" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FreelancerDashboard />} />
            <Route path="browse" element={<BrowseProjects />} />
            <Route path="project/:id" element={<ProjectDetails />} />
            <Route path="*" element={<div className="p-8">Page under construction</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
