import { useState, useEffect } from 'react';
import { FileText, Briefcase, DollarSign, Search, ArrowRight, Clock, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeBids, setActiveBids] = useState<any[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects!proposals_project_id_fkey (
            title,
            budget,
            budget_type,
            client:client_profiles(full_name)
          )
        `)
        .eq('freelancer_id', user!.id)
        .order('created_at', { ascending: false });

      if (bidsError) throw bidsError;
      setActiveBids(bidsData || []);

      // Fetch recommended projects (open projects)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          client:client_profiles(full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectsError) throw projectsError;
      setRecommendedProjects(projectsData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Proposals', value: activeBids.length.toString(), icon: FileText, color: 'text-accent' },
    { label: 'Active Contracts', value: activeBids.filter(b => b.status === 'accepted').length.toString(), icon: Briefcase, color: 'text-blue-600' },
    { label: 'Available Balance', value: '$0', icon: DollarSign, color: 'text-green-600' },
    { label: 'Job Success', value: '100%', icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-1">My Workspace</h1>
          <p className="text-text-secondary text-sm">Here is a summary of your freelance business today.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/freelancer/browse')} className="flex items-center gap-2">
          <Search size={18} />
          Find Work
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
        {/* Main Content Area (Active Bids) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold font-tenor">Your Active Bids</h2>
            </div>
            
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : activeBids.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">
                  You haven't submitted any proposals yet.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {activeBids.map((bid) => (
                    <div key={bid.id} className="p-6 hover:bg-surface/50 transition-colors group cursor-pointer" onClick={() => navigate(`/freelancer/project/${bid.project_id}`)}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors">
                          {bid.project?.title}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium capitalize border ${
                          bid.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                          bid.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className="text-text-primary font-semibold">${bid.proposed_rate}</span>
                        <span className="text-text-secondary font-medium">{bid.estimated_timeline}</span>
                        <span className="text-text-secondary">Client: {bid.project?.client?.full_name || 'Anonymous'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-xs text-text-muted flex items-center gap-1.5">
                          <Clock size={14} /> Bid submitted {new Date(bid.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Project <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-12">
              <h2 className="text-[20px] font-bold font-tenor">Recommended for You</h2>
              <Button variant="ghost" size="sm" className="text-text-secondary" onClick={() => navigate('/freelancer/browse')}>View More</Button>
            </div>
            
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : recommendedProjects.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">
                  No open projects found.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {recommendedProjects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-surface/50 transition-colors group cursor-pointer" onClick={() => navigate(`/freelancer/project/${project.id}`)}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[16px] text-text-primary group-hover:text-accent transition-colors">
                          {project.title}
                        </h3>
                        <button className="text-text-muted hover:text-accent bg-transparent border-none cursor-pointer">
                          <Star size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className="text-text-secondary font-medium capitalize">{project.budget_type}</span>
                        <span className="text-text-primary font-semibold">${project.budget}</span>
                        <span className="text-text-secondary">Client: {project.client?.full_name || 'Anonymous'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-xs text-text-muted flex items-center gap-1.5">
                          <Clock size={14} /> Posted {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Submit Proposal <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-[20px] font-bold font-tenor">Active Contracts</h2>
          
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-6 text-center text-sm text-text-secondary">
            Your accepted bids will appear here as active contracts.
          </div>
        </div>
      </div>
    </div>
  );
}
