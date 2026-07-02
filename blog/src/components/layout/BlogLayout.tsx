import { Link, Outlet } from 'react-router-dom';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export function BlogLayout() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="font-tenor text-2xl font-bold tracking-wider text-text-primary">
            Worklin_ <span className="text-accent text-lg">Blog</span>
          </Link>

          <div className="flex items-center gap-6">
            <a href="https://hireworklin.com" className="text-sm font-medium text-text-secondary hover:text-text-primary">
              Back to Marketplace
            </a>
            
            {user ? (
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <Button variant="primary" onClick={() => window.location.href = 'https://hireworklin.com/login'}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Link to="/" className="font-tenor text-2xl font-bold tracking-wider mb-4 block">
              Worklin_
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              The premier marketplace for elite freelance talent. Explore insights, tips, and platform updates.
            </p>
          </div>
          <div className="md:text-right">
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://hireworklin.com" className="hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="https://hireworklin.com/trust" className="hover:text-white transition-colors">Trust & Safety</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
