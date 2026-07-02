import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BlogLayout } from './components/layout/BlogLayout';
import { Blog } from './pages/Blog';
import { BlogPostDetails } from './pages/BlogPostDetails';
import { AdminBlogManager } from './pages/AdminBlogManager';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from('admins')
        .select('id')
        .eq('id', session.user.id)
        .single();
        
      setIsAdmin(!!data);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogLayout />}>
          <Route index element={<Blog />} />
          <Route path=":slug" element={<BlogPostDetails />} />
        </Route>
        
        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminBlogManager />
            </AdminRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
