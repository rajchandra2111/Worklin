import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Clock, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposal Form State
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    bid_amount: '',
    delivery_time: '1-2 weeks'
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:client_profiles (
            full_name,
            company_name,
            country
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('proposals').insert([{
        project_id: project.id,
        freelancer_id: user.id,
        cover_letter: proposalData.cover_letter,
        bid_amount: parseFloat(proposalData.bid_amount),
        delivery_time: proposalData.delivery_time,
        status: 'pending'
      }]);

      if (insertError) throw insertError;

      // Navigate to proposals tab or dashboard
      navigate('/freelancer/dashboard');
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/freelancer/browse')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back to Browse
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                {project.category}
              </span>
              <span className="text-sm text-text-muted flex items-center gap-1">
                <Clock size={14} /> Posted recently
              </span>
            </div>
            
            <h1 className="text-[28px] font-tenor font-bold mb-6 leading-tight text-text-primary">
              {project.title}
            </h1>

            <div className="prose max-w-none text-text-secondary leading-relaxed mb-8">
              {project.description.split('\\n').map((paragraph: string, i: number) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-3">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {project.skills && project.skills.map((skill: string, idx: number) => (
                <span key={idx} className="text-[14px] bg-surface text-text-secondary px-4 py-1.5 rounded-full border border-border font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Proposal Form Section */}
          {showProposalForm && (
            <div className="bg-white p-8 rounded-xl border border-accent shadow-md">
              <h2 className="text-xl font-bold font-tenor mb-6">Submit a Proposal</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleProposalSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-primary">Cover Letter</label>
                  <textarea
                    required
                    rows={6}
                    value={proposalData.cover_letter}
                    onChange={(e) => setProposalData({...proposalData, cover_letter: e.target.value})}
                    placeholder="Introduce yourself and explain why you're a great fit for this project..."
                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-primary">Bid Amount ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={proposalData.bid_amount}
                      onChange={(e) => setProposalData({...proposalData, bid_amount: e.target.value})}
                      placeholder="e.g. 1500"
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-primary">Estimated Delivery</label>
                    <select
                      value={proposalData.delivery_time}
                      onChange={(e) => setProposalData({...proposalData, delivery_time: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] bg-white"
                    >
                      <option value="Less than 1 week">Less than 1 week</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="More than 3 months">More than 3 months</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <Button type="button" variant="ghost" onClick={() => setShowProposalForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Send Proposal'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-secondary">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Project Budget</h3>
                <div className="flex items-center gap-1 text-accent font-bold text-xl">
                  <DollarSign size={20} />
                  {project.budget}
                </div>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">{project.budget_type}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 text-sm">
                <Clock className="text-text-muted mt-0.5" size={16} />
                <div>
                  <p className="font-semibold text-text-primary">Timeline</p>
                  <p className="text-text-secondary">{project.timeline}</p>
                </div>
              </div>
            </div>

            {!showProposalForm && (
              <Button 
                variant="primary" 
                className="w-full py-3 text-[15px]" 
                onClick={() => setShowProposalForm(true)}
              >
                Submit Proposal
              </Button>
            )}
          </div>

          {/* Client Info Widget */}
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 font-tenor text-lg">About the Client</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">{project.client?.full_name || 'Anonymous Client'}</p>
                {project.client?.company_name && (
                  <p className="text-xs text-text-secondary mt-0.5">{project.client.company_name}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={16} className="text-text-muted" />
                {project.client?.country || 'Location hidden'}
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-muted text-center">Member since 2024</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
