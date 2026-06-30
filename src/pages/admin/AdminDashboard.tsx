import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, FolderKanban, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'contracts'>('users');
  const [stats, setStats] = useState({ users: 0, projects: 0, contracts: 0 });

  // In a real app, you would fetch these lists from Supabase
  // For the MVP, we are setting up the structure.
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Just fetching counts for now
      const [clientCount, freelancerCount, projectCount, contractCount] = await Promise.all([
        supabase.from('client_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('freelancer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('contracts').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: (clientCount.count || 0) + (freelancerCount.count || 0),
        projects: projectCount.count || 0,
        contracts: contractCount.count || 0,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Admin Top Nav */}
      <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            <span className="font-bold font-tenor text-xl tracking-wide">Worklin Admin</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm font-medium"
          >
            <LogOut size={16} />
            Exit Admin
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col md:flex-row gap-8 mt-4">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-100 transition-colors ${activeTab === 'users' ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users size={18} className={activeTab === 'users' ? 'text-blue-500' : ''} />
              Users ({stats.users})
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-100 transition-colors ${activeTab === 'projects' ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FolderKanban size={18} className={activeTab === 'projects' ? 'text-amber-500' : ''} />
              Projects ({stats.projects})
            </button>
            <button 
              onClick={() => setActiveTab('contracts')}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${activeTab === 'contracts' ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ShieldAlert size={18} className={activeTab === 'contracts' ? 'text-green-500' : ''} />
              Contracts ({stats.contracts})
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 capitalize">{activeTab} Management</h1>
          
          <div className="flex flex-col items-center justify-center text-slate-400 py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            {activeTab === 'users' && <Users size={48} className="mb-4 text-slate-300" />}
            {activeTab === 'projects' && <FolderKanban size={48} className="mb-4 text-slate-300" />}
            {activeTab === 'contracts' && <ShieldAlert size={48} className="mb-4 text-slate-300" />}
            
            <p className="font-medium text-slate-600 mb-1">No active items to display.</p>
            <p className="text-sm">Connect this to a full Supabase table query to manage {activeTab}.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
