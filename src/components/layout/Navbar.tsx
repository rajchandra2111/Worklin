import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useUiStore } from '../../store/uiStore';

export function Navbar() {
  const { openAuthModal } = useUiStore();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="no-underline">
          <img src="/worklin_primary.png" alt="Worklin" className="h-8" />
        </Link>
        
        <div className="hidden md:flex items-center gap-2">
          <Link 
            to="/for-clients" 
            className={`text-sm font-medium px-3 py-1.5 rounded-sm transition-colors ${location.pathname === '/for-clients' ? 'text-text-primary bg-surface' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
          >
            For Clients
          </Link>
          <Link 
            to="/for-freelancers" 
            className={`text-sm font-medium px-3 py-1.5 rounded-sm transition-colors ${location.pathname === '/for-freelancers' ? 'text-text-primary bg-surface' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
          >
            For Freelancers
          </Link>
          <Link 
            to="/browse" 
            className={`text-sm font-medium px-3 py-1.5 rounded-sm transition-colors ${location.pathname === '/browse' ? 'text-text-primary bg-surface' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
          >
            Browse Projects
          </Link>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => openAuthModal('login')}>Log in</Button>
          <Button variant="primary" onClick={() => openAuthModal('signup', 'client')}>Post a project</Button>
        </div>
      </div>
    </nav>
  );
}
