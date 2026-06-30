import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function FreelancerProposals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('freelancer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const projectIds = [...new Set(data.map(p => p.project_id))];
        const { data: projectsData } = await supabase.from('projects').select('id, title, status, client_id').in('id', projectIds);
        
        if (projectsData && projectsData.length > 0) {
          const clientIds = [...new Set(projectsData.map(p => p.client_id))];
          const { data: clientsData } = await supabase.from('client_profiles').select('id, full_name, company_name').in('id', clientIds);
          
          data.forEach(p => {
            const proj = projectsData.find(pr => pr.id === p.project_id);
            if (proj) {
              const client = clientsData?.find(c => c.id === proj.client_id);
              p.project = { ...proj, client };
            }
          });
        }
      }
      
      setProposals(data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
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
      <div className="bg-white p-8 rounded-xl border border-border shadow-sm mb-8">
        <h1 className="text-[28px] font-tenor font-bold mb-2">My Active Bids</h1>
        <p className="text-text-secondary">Track the status of all your submitted proposals.</p>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-2">No active bids</h3>
            <p className="text-text-secondary mb-6">You haven't submitted any proposals yet.</p>
            <Button variant="primary" onClick={() => navigate('/freelancer/browse')}>
              Find Projects
            </Button>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-accent/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                      proposal.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                      proposal.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {proposal.status}
                    </span>
                    <span className="text-sm text-text-muted">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h2 
                    className="text-xl font-bold text-text-primary hover:text-accent cursor-pointer transition-colors mb-1"
                    onClick={() => navigate(`/freelancer/project/${proposal.project_id}`)}
                  >
                    {proposal.project?.title || 'Unknown Project'}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Client: {proposal.project?.client?.company_name || proposal.project?.client?.full_name || 'Anonymous'}
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0 bg-surface/50 p-4 rounded-lg border border-border">
                  <div className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-1">Your Bid</div>
                  <div className="flex items-center gap-1.5 text-text-primary font-bold text-lg">
                    <DollarSign size={18} className="text-accent" />
                    {proposal.proposed_rate}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock size={16} /> {proposal.estimated_timeline}
                  </div>
                </div>

              </div>

              {proposal.status === 'accepted' && (
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                    <CheckCircle size={18} />
                    Congratulations! The client has accepted your bid.
                  </div>
                  <Button variant="primary" onClick={() => navigate('/freelancer/contracts')}>
                    View Contract
                  </Button>
                </div>
              )}

              {proposal.status === 'rejected' && (
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-red-500 font-semibold text-sm">
                  <XCircle size={18} />
                  The client has selected another freelancer for this project.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
