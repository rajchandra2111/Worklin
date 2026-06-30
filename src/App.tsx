import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { HireFreelancers } from './pages/HireFreelancers';
import { BrowseProjects } from './pages/BrowseProjects';
import { useEffect } from 'react';
import { useUiStore } from './store/uiStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ClientDashboard } from './pages/dashboard/ClientDashboard';
import { ClientProjectProposals } from './pages/dashboard/ClientProjectProposals';
import { ClientProjects } from './pages/dashboard/ClientProjects';
import { FreelancerDashboard } from './pages/dashboard/FreelancerDashboard';
import { Onboarding } from './pages/dashboard/Onboarding';
import { PostProject } from './pages/dashboard/PostProject';
import { ProjectDetails } from './pages/dashboard/ProjectDetails';
import { ClientSettings } from './pages/dashboard/ClientSettings';
import { FreelancerSettings } from './pages/dashboard/FreelancerSettings';
import { FreelancerProposals } from './pages/dashboard/FreelancerProposals';
import { FreelancerEarnings } from './pages/dashboard/FreelancerEarnings';
import { FreelancerContracts } from './pages/dashboard/FreelancerContracts';
import { FreelancerProfile } from './pages/profiles/FreelancerProfile';
import { ClientProfile } from './pages/profiles/ClientProfile';

import { Messages } from './pages/dashboard/Messages';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';

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
          <Route path="hire" element={<HireFreelancers />} />
          <Route path="browse" element={<BrowseProjects />} />
          <Route path="login" element={<LoginRedirect />} />
          <Route path="signup" element={<SignupRedirect />} />
        </Route>

        <Route path="/onboarding" element={<Onboarding />} />

        {/* Public Profile Routes */}
        <Route path="/freelancer/profile/:username" element={<FreelancerProfile />} />
        <Route path="/client/profile/:username" element={<ClientProfile />} />

        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/client" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjects />} />
            <Route path="post-project" element={<PostProject />} />
            <Route path="project/:id/proposals" element={<ClientProjectProposals />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<ClientSettings />} />
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
            <Route path="messages" element={<Messages />} />
            <Route path="proposals" element={<FreelancerProposals />} />
            <Route path="contracts" element={<FreelancerContracts />} />
            <Route path="earnings" element={<FreelancerEarnings />} />
            <Route path="settings" element={<FreelancerSettings />} />
            <Route path="*" element={<div className="p-8">Page under construction</div>} />
          </Route>
        </Route>

        {/* Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
