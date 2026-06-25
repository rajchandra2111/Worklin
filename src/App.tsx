import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ForClients } from './pages/ForClients';
import { ForFreelancers } from './pages/ForFreelancers';
import { useEffect } from 'react';
import { useUiStore } from './store/uiStore';

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="for-clients" element={<ForClients />} />
          <Route path="for-freelancers" element={<ForFreelancers />} />
          <Route path="login" element={<LoginRedirect />} />
          <Route path="signup" element={<SignupRedirect />} />
          {/* Fallback for browse for now */}
          <Route path="browse" element={<Navigate to="/#browse-freelancers" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
