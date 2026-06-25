import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ClientProjectProposals() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Fetch Project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (projectError) throw projectError;
      setProject(projectData);

      // 2. Fetch Proposals
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          *,
          freelancer:freelancer_profiles (
            full_name,
            country,
            hourly_rate,
            skills
          )
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (proposalError) throw proposalError;
      setProposals(proposalData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setProcessing(proposalId);
    try {
      // Call the atomic RPC to accept bid and reject others
      const { error } = await supabase.rpc('accept_proposal', { p_proposal_id: proposalId });
      
      if (error) throw error;

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error accepting proposal:', err);
      alert('Failed to accept proposal.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center p-12">Project not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/client/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-xl border border-border shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-tenor font-bold mb-2">Review Proposals</h1>
            <p className="text-text-secondary">Project: <span className="font-semibold text-text-primary">{project.title}</span></p>
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize border ${
            project.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-green-50 text-green-700 border-green-200'
          }`}>
            Status: {project.status}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {proposals.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-2">No proposals yet</h3>
            <p className="text-text-secondary">Freelancers haven't submitted any bids for this project yet.</p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal.id} className={`bg-white p-8 rounded-xl border shadow-sm transition-all ${proposal.status === 'accepted' ? 'border-green-500 shadow-md ring-1 ring-green-500/20' : 'border-border'}`}>
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Freelancer Info */}
                <div className="md:w-1/3 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent-dim text-accent flex items-center justify-center font-bold text-xl">
                      {proposal.freelancer?.full_name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{proposal.freelancer?.full_name || 'Anonymous'}</h3>
                      <p className="text-sm text-text-secondary">{proposal.freelancer?.country || 'Location unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-text-muted">Bid Amount</span>
                      <span className="font-bold text-text-primary text-lg">${proposal.proposed_rate}</span>
                    </div>
                    <div className="flex flex-col border-l border-border pl-4">
                      <span className="text-text-muted">Timeline</span>
                      <span className="font-semibold text-text-primary">{proposal.estimated_timeline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {proposal.freelancer?.skills?.map((skill: string, idx: number) => (
                      <span key={idx} className="text-[12px] bg-surface text-text-secondary px-2 py-1 rounded border border-border">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Letter & Actions */}
                <div className="md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3">Cover Letter</h4>
                    <p className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {proposal.cover_letter}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <div>
                      {proposal.status === 'accepted' && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle size={20} />
                          Proposal Accepted
                        </div>
                      )}
                      {proposal.status === 'rejected' && (
                        <div className="text-red-500 font-semibold">
                          Not Selected
                        </div>
                      )}
                    </div>
                    
                    {project.status === 'open' && proposal.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button variant="outline">Message</Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleAcceptProposal(proposal.id)}
                          disabled={processing === proposal.id}
                        >
                          {processing === proposal.id ? 'Accepting...' : 'Accept & Hire'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
