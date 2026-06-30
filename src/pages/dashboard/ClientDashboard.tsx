import { useState, useEffect } from 'react';
import { FolderOpen, FileText, CreditCard, MessageSquare, Plus, ArrowRight, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // Fetch projects and the count of their proposals
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          proposals!proposals_project_id_fkey(count)
        `)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeProjectsCount = projects.filter(p => p.status === 'open' || p.status === 'hired' || p.status === 'in_progress').length;
  // Calculate total pending proposals across all projects
  // Wait, Supabase returns proposals: [{ count: X }] when doing proposals(count).
  const pendingProposalsCount = projects.reduce((acc, project) => {
    const count = project.proposals?.[0]?.count || 0;
    return acc + count;
  }, 0);

  const stats = [
    { label: 'Active Projects', value: activeProjectsCount.toString(), icon: FolderOpen, color: 'text-accent' },
    { label: 'Total Proposals', value: pendingProposalsCount.toString(), icon: FileText, color: 'text-blue-600' },
    { label: 'Escrow Balance', value: '$0', icon: CreditCard, color: 'text-green-600' },
    { label: 'Unread Messages', value: '0', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const statusColors: Record<string, string> = {
    'open': 'bg-blue-50 text-blue-700 border-blue-200',
    'hired': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'in_progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'completed': 'bg-green-50 text-green-700 border-green-200',
    'cancelled': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-1">Overview</h1>
          <p className="text-text-secondary text-sm">Welcome back. Here's what's happening with your projects.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/client/post-project')} className="flex items-center gap-2">
          <Plus size={18} />
          Post New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-lg bg-surface ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <span className="text-[32px] font-bold text-text-primary tracking-tight">{stat.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Projects) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold font-tenor">Your Projects</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                You haven't posted any projects yet.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {projects.map((project) => {
                  const proposalCount = project.proposals?.[0]?.count || 0;
                  return (
                    <div 
                      key={project.id} 
                      className="p-6 hover:bg-surface/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/client/project/${project.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors">
                          {project.title}
                        </h3>
                        <button className="text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium border capitalize ${statusColors[project.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {project.status}
                        </span>
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <FileText size={14} /> {proposalCount} Proposals
                        </span>
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <CreditCard size={14} /> {project.budget} ({project.budget_type})
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-xs text-text-muted flex items-center gap-1.5">
                          <Clock size={14} /> Posted {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Proposals <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-[20px] font-bold font-tenor">Action Items</h2>
          
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-start gap-4 mb-5 pb-5 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Review new proposals</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  You have {pendingProposalsCount} total proposals to review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
