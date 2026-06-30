import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, ShieldCheck, Lock, ArrowLeft, Star, DollarSign, Clock, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ClientProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'contract'>('overview');

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

      // 3. If hired, fetch the contract
      if (projectData.status === 'in_progress' || projectData.status === 'completed' || projectData.status === 'hired') {
        const { data: contractData } = await supabase
          .from('contracts')
          .select('*')
          .eq('project_id', id)
          .single();
        if (contractData) {
          setContract(contractData);
          if (activeTab === 'overview') {
            setActiveTab('contract');
          }
        }
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setProcessing(proposalId);
    try {
      const { error } = await supabase.rpc('accept_proposal', { p_proposal_id: proposalId });
      if (error) throw error;
      await fetchData();
      setActiveTab('contract');
    } catch (err) {
      console.error('Error accepting proposal:', err);
      alert('Failed to accept proposal.');
    } finally {
      setProcessing(null);
    }
  };

  const handleFundEscrow = async () => {
    if (!contract) return;
    setProcessing('funding');
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { contractId: contract.id }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error funding escrow:', err);
      alert('Failed to initiate payment.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReleasePayment = async () => {
    if (!contract) return;
    setProcessing('releasing');
    try {
      const { error } = await supabase.rpc('release_escrow', { p_contract_id: contract.id });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error releasing payment:', err);
      alert('Failed to release payment.');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelProject = async () => {
    if (!confirm('Are you sure you want to cancel this project posting?')) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error cancelling project:', err);
      alert('Failed to cancel project.');
    }
  };

  const submitReview = async () => {
    if (!contract) return;
    setReviewSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        contract_id: contract.id,
        project_id: project.id,
        reviewer_id: user?.id,
        freelancer_id: contract.freelancer_id,
        client_id: user?.id,
        rating: reviewRating,
        feedback: reviewFeedback,
        type: 'client_to_freelancer'
      }]);

      if (error) throw error;
      
      const { error: contractUpdateError } = await supabase
        .from('contracts')
        .update({ has_client_review: true })
        .eq('id', contract.id);

      if (contractUpdateError) throw contractUpdateError;
      
      setShowReviewModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
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
    return <div className="p-8">Project not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/client/projects')}
        className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Projects
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-tenor font-bold mb-2">{project.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              project.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
              project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              project.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              {project.status === 'in_progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            <span className="text-text-secondary text-sm">
              Posted {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'overview' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'proposals' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Proposals
          <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'proposals' ? 'bg-accent/10 text-accent' : 'bg-surface text-text-secondary'}`}>
            {proposals.length}
          </span>
        </button>
        {contract && (
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'contract' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            Contract details
            {contract.status === 'active' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold mb-4 font-tenor">Project Description</h3>
                <p className="whitespace-pre-wrap text-text-secondary leading-relaxed">{project.description}</p>
              </div>

              {project.skills && project.skills.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold mb-4 font-tenor">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-surface text-text-secondary rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold mb-4 font-tenor">Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-text-secondary mb-1 flex items-center gap-2">
                      <DollarSign size={16} /> Budget
                    </div>
                    <div className="font-semibold">
                      {project.budget_type === 'hourly' ? `€${project.budget}/hr` : `€${project.budget} total`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-1 flex items-center gap-2">
                      <Clock size={16} /> Timeline
                    </div>
                    <div className="font-semibold">{project.timeline}</div>
                  </div>
                </div>
              </div>

              {project.status === 'open' && (
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold mb-4 font-tenor">Actions</h3>
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={handleCancelProject}>
                    Cancel Project
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROPOSALS TAB */}
        {activeTab === 'proposals' && (
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-border shadow-sm text-center">
                <p className="text-text-secondary">No proposals received yet.</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white p-6 rounded-xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl font-bold text-text-secondary">
                        {proposal.freelancer?.full_name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{proposal.freelancer?.full_name || 'Freelancer'}</h3>
                        <p className="text-text-secondary text-sm">{proposal.freelancer?.country || 'Location hidden'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">€{proposal.bid_amount}</div>
                      <div className="text-sm text-text-secondary">{proposal.estimated_timeline}</div>
                    </div>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2">Cover Letter</h4>
                    <p className="text-text-secondary whitespace-pre-wrap">{proposal.cover_letter}</p>
                  </div>

                  {project.status === 'open' && (
                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Message</Button>
                      <Button 
                        onClick={() => handleAcceptProposal(proposal.id)}
                        disabled={processing === proposal.id}
                      >
                        {processing === proposal.id ? 'Processing...' : 'Hire Freelancer'}
                      </Button>
                    </div>
                  )}
                  {proposal.status === 'accepted' && (
                    <div className="flex justify-end">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckCircle size={16} /> Accepted
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTRACT TAB */}
        {activeTab === 'contract' && contract && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-6 font-tenor">Contract Status</h3>
              
              <div className="flex items-center gap-8 mb-8">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    contract.escrow_status === 'funded' || contract.escrow_status === 'released'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div className="font-medium">Escrow</div>
                  <div className="text-sm text-text-secondary">{contract.escrow_status}</div>
                </div>
                
                <div className="flex-1 h-1 bg-surface relative">
                  <div className={`absolute left-0 top-0 h-full transition-all ${
                     contract.escrow_status === 'released' ? 'bg-green-500 w-full' :
                     contract.escrow_status === 'funded' ? 'bg-blue-500 w-1/2' :
                     'bg-transparent w-0'
                  }`} />
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    contract.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-surface text-text-secondary'
                  }`}>
                    <CheckCircle size={24} />
                  </div>
                  <div className="font-medium">Completed</div>
                  <div className="text-sm text-text-secondary">Project Finished</div>
                </div>
              </div>

              {contract.status === 'active' && contract.escrow_status === 'pending' && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center">
                  <Lock className="mx-auto text-blue-600 mb-2" size={32} />
                  <h4 className="font-bold text-blue-900 mb-2">Fund Escrow to Begin Work</h4>
                  <p className="text-blue-700 mb-6 max-w-lg mx-auto">
                    Please deposit €{contract.amount} into escrow. This amount will be held securely and only released when you approve the final work.
                  </p>
                  <Button onClick={handleFundEscrow} disabled={processing === 'funding'}>
                    {processing === 'funding' ? 'Processing...' : 'Fund Escrow (€' + contract.amount + ')'}
                  </Button>
                </div>
              )}

              {contract.status === 'active' && contract.escrow_status === 'funded' && (
                <div className="space-y-6">
                  {contract.work_submitted_at ? (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-lg">
                      <div className="flex items-center gap-3 text-green-800 font-bold mb-4">
                        <CheckCircle size={24} /> Work Submitted
                      </div>
                      <div className="mb-6 bg-white p-4 rounded border border-green-100">
                        <div className="font-medium mb-2 text-sm text-text-secondary flex items-center gap-2">
                          <FileText size={16} /> Freelancer Notes
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap">{contract.submission_notes}</p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline">Request Revision</Button>
                        <Button onClick={handleReleasePayment} disabled={processing === 'releasing'}>
                          {processing === 'releasing' ? 'Releasing...' : 'Approve & Release Payment'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface p-6 rounded-lg text-center">
                      <Clock className="mx-auto text-text-secondary mb-2" size={32} />
                      <h4 className="font-bold mb-2">Work in Progress</h4>
                      <p className="text-text-secondary">The freelancer is currently working on your project. The funds are secure in escrow.</p>
                    </div>
                  )}
                </div>
              )}

              {contract.status === 'completed' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Project Completed!</h4>
                  <p className="text-text-secondary mb-6">Payment of €{contract.amount} has been released to the freelancer.</p>
                  
                  {!contract.has_client_review && (
                    <Button onClick={() => setShowReviewModal(true)}>
                      Leave a Review
                    </Button>
                  )}
                  {contract.has_client_review && (
                    <div className="text-green-600 font-medium">You have left a review for this project.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold font-tenor mb-4">Rate your experience</h3>
            <p className="text-text-secondary mb-6">How was it working with this freelancer?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setReviewRating(star)}
                  className={`p-2 transition-colors ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star size={32} fill={reviewRating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">Public Feedback</label>
              <textarea 
                className="w-full rounded-lg border-border focus:border-accent focus:ring-accent"
                rows={4}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Share your experience working with them..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowReviewModal(false)}>Cancel</Button>
              <Button onClick={submitReview} disabled={reviewSubmitting || !reviewFeedback.trim()}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
