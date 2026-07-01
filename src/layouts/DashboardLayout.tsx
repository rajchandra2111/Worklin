import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, FileText, FolderOpen, MessageSquare, 
  CreditCard, Star, Settings, Briefcase, Search, DollarSign, LogOut 
} from 'lucide-react';

export function DashboardLayout() {
  const CURRENT_TOS_VERSION = 'v1.0';
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{name: string, avatar: string, id: string, username?: string, tosVersion?: string} | null>(null);
  const [showComplianceGate, setShowComplianceGate] = useState(false);
  const [acceptingTos, setAcceptingTos] = useState(false);

  useEffect(() => {
    if (user && role) {
      fetchProfile();
    }
    
    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user, role]);

  const fetchProfile = async () => {
    try {
      if (role === 'client') {
        const { data } = await supabase.from('client_profiles').select('full_name, company_name, company_logo, avatar_url, first_name, username, accepted_tos_version').eq('id', user?.id).single();
        if (data) {
          setProfile({
            name: data.company_name || data.full_name || data.first_name,
            avatar: data.company_logo || data.avatar_url || '',
            id: user!.id,
            username: data.username,
            tosVersion: data.accepted_tos_version
          });
          if (data.accepted_tos_version !== CURRENT_TOS_VERSION) {
            setShowComplianceGate(true);
          }
        }
      } else if (role === 'freelancer') {
        const { data } = await supabase.from('freelancer_profiles').select('full_name, avatar_url, first_name, username, accepted_tos_version').eq('id', user?.id).single();
        if (data) {
          setProfile({
            name: data.full_name || data.first_name,
            avatar: data.avatar_url || '',
            id: user!.id,
            username: data.username,
            tosVersion: data.accepted_tos_version
          });
          if (data.accepted_tos_version !== CURRENT_TOS_VERSION) {
            setShowComplianceGate(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile for layout:', err);
    }
  };

  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Hire Freelancers', path: '/client/hire', icon: Search },
    { name: 'Post Project', path: '/client/post-project', icon: FileText },
    { name: 'My Projects', path: '/client/projects', icon: FolderOpen },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    { name: 'Payments', path: '/client/payments', icon: DollarSign },
    { name: 'Billing', path: '/client/billing', icon: CreditCard },
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
    { name: 'Billing', path: '/freelancer/billing', icon: CreditCard },
    { name: 'Reviews', path: '/freelancer/reviews', icon: Star },
    { name: 'Settings', path: '/freelancer/settings', icon: Settings },
  ];

  const links = role === 'client' ? clientLinks : freelancerLinks;

  const handleProfileClick = () => {
    if (profile?.username) {
      navigate(`/${role}/profile/${profile.username}`);
    } else if (profile?.id) {
      navigate(`/${role}/profile/${profile.id}`);
    }
  };

  const handleAcceptTos = async () => {
    if (!user || !role) return;
    setAcceptingTos(true);
    try {
      const table = role === 'client' ? 'client_profiles' : 'freelancer_profiles';
      const { error } = await supabase
        .from(table)
        .update({ accepted_tos_version: CURRENT_TOS_VERSION })
        .eq('id', user.id);
      
      if (error) throw error;
      setShowComplianceGate(false);
      setProfile(prev => prev ? { ...prev, tosVersion: CURRENT_TOS_VERSION } : null);
    } catch (err) {
      console.error('Error accepting TOS:', err);
      alert('Failed to accept terms. Please try again.');
    } finally {
      setAcceptingTos(false);
    }
  };

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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header */}
        <header className="h-[72px] border-b border-border bg-white px-6 flex items-center justify-end shrink-0 gap-2 sticky top-0 z-10">
          {profile && (
            <div 
              onClick={handleProfileClick}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface py-1.5 px-3 rounded-md transition-colors"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-text-primary leading-tight">{profile.name}</span>
                <span className="text-[11px] text-text-secondary">View Profile</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar.startsWith('http') ? profile.avatar : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar}`} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name?.[0] || 'U'
                )}
              </div>
            </div>
          )}
          
          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
          
          <button 
            onClick={signOut}
            className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none outline-none"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-[1200px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Compliance Gate Modal */}
      {showComplianceGate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
            <h2 className="text-2xl font-tenor font-bold text-text-primary mb-2">Updated Terms of Service</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We've updated our Terms of Service and Privacy Policy. To continue using Worklin, 
              please review and accept the latest terms. This helps us ensure a secure and compliant environment for everyone.
            </p>
            
            <div className="bg-surface p-4 rounded-lg border border-border mb-6">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  <a href="/terms" target="_blank" className="text-text-primary hover:text-accent font-medium underline-offset-4 hover:underline">Read our Terms of Service</a>
                </li>
                <li className="flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  <a href="/privacy" target="_blank" className="text-text-primary hover:text-accent font-medium underline-offset-4 hover:underline">Read our Privacy Policy</a>
                </li>
              </ul>
            </div>
            
            <p className="text-xs text-text-muted mb-8">
              By clicking "I Accept", you acknowledge that you have read and agree to be bound by the updated Terms of Service and Privacy Policy.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={signOut}
                className="flex-1 py-3 px-4 bg-white border border-border rounded-md text-text-secondary font-medium hover:bg-surface transition-colors cursor-pointer"
              >
                Log Out
              </button>
              <button 
                onClick={handleAcceptTos}
                disabled={acceptingTos}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-accent transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {acceptingTos ? 'Saving...' : 'I Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
