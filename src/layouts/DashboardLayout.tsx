import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, FileText, FolderOpen, MessageSquare, 
  CreditCard, Star, Settings, Briefcase, Search, DollarSign, LogOut 
} from 'lucide-react';

export function DashboardLayout() {
  const { role, signOut } = useAuth();
  const location = useLocation();

  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Post Project', path: '/client/post-project', icon: FileText },
    { name: 'My Projects', path: '/client/projects', icon: FolderOpen },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    { name: 'Payments', path: '/client/payments', icon: CreditCard },
    { name: 'Reviews', path: '/client/reviews', icon: Star },
    { name: 'Settings', path: '/client/settings', icon: Settings },
  ];

  const freelancerLinks = [
    { name: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Projects', path: '/freelancer/browse', icon: Search },
    { name: 'My Proposals', path: '/freelancer/proposals', icon: FileText },
    { name: 'My Contracts', path: '/freelancer/contracts', icon: Briefcase },
    { name: 'Messages', path: '/freelancer/messages', icon: MessageSquare },
    { name: 'Earnings', path: '/freelancer/earnings', icon: DollarSign },
    { name: 'Reviews', path: '/freelancer/reviews', icon: Star },
    { name: 'Settings', path: '/freelancer/settings', icon: Settings },
  ];

  const links = role === 'client' ? clientLinks : freelancerLinks;

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to={role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} className="text-[22px] text-primary no-underline font-tenor tracking-widest">
            Worklin<span className="text-accent">_</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent' 
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={signOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
