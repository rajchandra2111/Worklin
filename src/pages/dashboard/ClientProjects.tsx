import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FolderOpen, Users, Briefcase, DollarSign, Clock, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type TabType = 'open' | 'in_progress' | 'completed' | 'cancelled';

export function ClientProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('open');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // 1. Fetch projects
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        
        // 2. Fetch proposals to count applicants
        const { data: proposalsData } = await supabase
          .from('proposals')
          .select('project_id')
          .in('project_id', projectIds);
          
        // 3. Fetch contracts to track active work and spent money
        const { data: contractsData } = await supabase
          .from('contracts')
          .select('project_id, amount, status')
          .in('project_id', projectIds);
          
        // Append metrics to each project
        projectsData.forEach(p => {
          p.proposalCount = proposalsData?.filter(prop => prop.project_id === p.id).length || 0;
          
          const projectContracts = contractsData?.filter(c => c.project_id === p.id) || [];
          p.activeContractsCount = projectContracts.filter(c => c.status === 'active').length;
          p.totalSpent = projectContracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        });
      }
      
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const openProjects = projects.filter(p => p.status === 'open');
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const cancelledProjects = projects.filter(p => p.status === 'cancelled');

  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'open': return openProjects;
      case 'in_progress': return inProgressProjects;
      case 'completed': return completedProjects;
      case 'cancelled': return cancelledProjects;
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-2">My Projects</h1>
          <p className="text-text-secondary">Manage your project postings, review proposals, and oversee ongoing contracts.</p>
        </div>
        <Button onClick={() => navigate('/client/post-project')}>
          Post New Project
        </Button>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">Active Postings</div>
            <div className="text-2xl font-bold font-tenor">{openProjects.length}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">In Progress</div>
            <div className="text-2xl font-bold font-tenor">{inProgressProjects.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">Total Spent</div>
            <div className="text-2xl font-bold font-tenor">
              €{projects.reduce((acc, p) => acc + (p.totalSpent || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'open' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Open ({openProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'in_progress' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          In Progress ({inProgressProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'completed' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Completed ({completedProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'cancelled' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Cancelled ({cancelledProjects.length})
        </button>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {getFilteredProjects().length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-border shadow-sm text-center">
            <FolderOpen size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No projects found</h3>
            <p className="text-text-secondary">You don't have any projects in this status.</p>
            {activeTab === 'open' && (
              <div className="mt-6">
                <Button onClick={() => navigate('/client/post-project')}>
                  Post Your First Project
                </Button>
              </div>
            )}
          </div>
        ) : (
          getFilteredProjects().map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Left Col: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link to={`/project/${project.id}`} className="text-xl font-bold font-tenor text-text-primary hover:text-accent transition-colors truncate">
                      {project.title}
                    </Link>
                    {activeTab === 'open' && (
                      <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium shrink-0">
                        Accepting Proposals
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-text-secondary mb-4 truncate">
                    {project.category}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                      <DollarSign size={14} />
                      <span className="font-semibold text-text-primary">
                        {project.budget_type === 'hourly' ? `€${project.budget}/hr` : `€${project.budget} total`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                      <Clock size={14} />
                      <span>{project.timeline}</span>
                    </div>
                    
                    {activeTab === 'open' && (
                      <div className="flex items-center gap-1.5 text-accent bg-accent/5 border border-accent/10 px-3 py-1.5 rounded-full">
                        <Users size={14} />
                        <span className="font-semibold">{project.proposalCount} Proposals</span>
                      </div>
                    )}
                    
                    {activeTab === 'in_progress' && (
                      <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                        <Briefcase size={14} />
                        <span className="font-semibold">{project.activeContractsCount} Active Contracts</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  {activeTab === 'open' && (
                    <>
                      <Button onClick={() => navigate(`/client/project/${project.id}/proposals`)} className="w-full md:w-auto">
                        <Users size={16} />
                        View Proposals
                      </Button>
                    </>
                  )}
                  
                  {activeTab === 'in_progress' && (
                    <>
                      <Button onClick={() => navigate(`/client/project/${project.id}/contracts`)} className="w-full md:w-auto">
                        <Briefcase size={16} />
                        Manage Contracts
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/client/messages')} className="w-full md:w-auto">
                        Message Freelancers
                      </Button>
                    </>
                  )}

                  {activeTab === 'completed' && (
                    <>
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium mb-2 border border-green-200 w-full text-center md:text-left">
                        Project Completed
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/project/${project.id}`)} className="w-full md:w-auto">
                        View Details
                      </Button>
                    </>
                  )}

                  {activeTab === 'cancelled' && (
                    <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium border border-red-200 w-full text-center md:text-left">
                      Posting Cancelled
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
