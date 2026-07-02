import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Clock, DollarSign, MapPin, Briefcase, Star, Upload, File as FileIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatCurrency, getCurrencyForCountry } from '../../lib/currency';

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingProposal, setExistingProposal] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Proposal Form State
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    cover_letter: '',
    bid_amount: '',
    deposit_required: '',
    delivery_time: '1-2 weeks',
    attachments: [] as string[]
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
    if (user) {
      fetchExistingProposal();
    }
  }, [id, user]);

  const fetchExistingProposal = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('proposals')
        .select('*')
        .eq('project_id', id)
        .eq('freelancer_id', user.id)
        .maybeSingle();
      
      if (data) {
        setExistingProposal(data);
        if (data.status === 'accepted') {
          // Fetch the associated contract
          const { data: contractData } = await supabase
            .from('contracts')
            .select('*')
            .eq('proposal_id', data.id)
            .maybeSingle();
          if (contractData) setContract(contractData);
        }
      }
    } catch (err) {
      console.error('Error fetching existing proposal:', err);
    }
  };

  const handleSubmitWork = async () => {
    if (!contract || !submissionNotes.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          work_submitted_at: new Date().toISOString(),
          submission_notes: submissionNotes
        })
        .eq('id', contract.id);
      
      if (error) throw error;
      alert('Work submitted successfully! Waiting for client approval.');
      fetchExistingProposal(); // Refresh data
    } catch (err: any) {
      console.error('Error submitting work:', err);
      alert(err.message || 'Failed to submit work.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposal_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proposal_attachments')
        .getPublicUrl(filePath);

      setProposalData(prev => ({
        ...prev,
        attachments: [...prev.attachments, publicUrl]
      }));
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
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
        proposed_rate: parseFloat(proposalData.bid_amount),
        deposit_required: proposalData.deposit_required ? parseFloat(proposalData.deposit_required) : 0,
        estimated_timeline: proposalData.delivery_time,
        attachments: proposalData.attachments,
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
            
            {/* Submit Work Section */}
            {contract && contract.status === 'active' && !contract.work_submitted_at && (
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-8">
                <h3 className="font-bold text-blue-900 mb-2 font-tenor text-lg">Submit Deliverables</h3>
                <p className="text-sm text-blue-800 mb-4">The client has funded the escrow. Submit your work or final notes here to request payment release.</p>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Provide links to work, attachments, or final notes..."
                  className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-[15px] mb-4 bg-white"
                  rows={4}
                />
                <Button variant="primary" onClick={handleSubmitWork} disabled={submitting || !submissionNotes.trim()}>
                  {submitting ? 'Submitting...' : 'Submit Work for Payment'}
                </Button>
              </div>
            )}
            
            {contract && contract.work_submitted_at && contract.status !== 'completed' && (
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 mt-8 flex items-center gap-4 text-amber-800">
                <Clock size={32} className="shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Work Submitted</h3>
                  <p className="text-sm">You have submitted your deliverables. Waiting for the client to approve and release funds.</p>
                </div>
              </div>
            )}
            
            {contract && contract.status === 'completed' && (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 mt-8 flex items-center gap-4 text-green-800">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Project Completed</h3>
                  <p className="text-sm">The client has approved your work and released the funds to your account!</p>
                </div>
              </div>
            )}
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
                    <label className="block text-sm font-semibold text-text-primary">
                      Your Quote <span className="text-xs font-normal text-text-secondary block">Budget to finish full project</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        {getCurrencyForCountry(project.client?.country).symbol}
                      </div>
                      <input
                        type="number"
                        required
                        min="1"
                        value={proposalData.bid_amount}
                        onChange={(e) => setProposalData({...proposalData, bid_amount: e.target.value})}
                        placeholder="e.g. 1500"
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-text-primary">
                      Deposit Required <span className="text-xs font-normal text-text-secondary block">Amount to add to SafePay upfront</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                        {getCurrencyForCountry(project.client?.country).symbol}
                      </div>
                      <input
                        type="number"
                        required
                        min="1"
                        value={proposalData.deposit_required}
                        onChange={(e) => setProposalData({...proposalData, deposit_required: e.target.value})}
                        placeholder="e.g. 500"
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
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

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-primary">Add relative files (optional)</label>
                  <div className="flex flex-wrap gap-3">
                    {proposalData.attachments.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border text-sm">
                        <FileIcon size={14} className="text-accent" />
                        <span className="truncate max-w-[150px]">Attachment {idx + 1}</span>
                      </div>
                    ))}
                    <label className="flex items-center gap-2 bg-white px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:text-accent hover:border-accent cursor-pointer transition-colors">
                      <Upload size={16} />
                      {uploading ? 'Uploading...' : 'Upload File'}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
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

            {existingProposal ? (
              <div className="bg-surface p-4 rounded-xl border border-border">
                <h4 className="font-bold text-text-primary mb-3">Your Proposal</h4>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-text-secondary">Status</span>
                  <span className={`px-2.5 py-1 rounded-md text-[12px] font-medium capitalize border ${
                    existingProposal.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                    existingProposal.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {existingProposal.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-text-secondary">Bid Amount</span>
                  <span className="font-bold text-text-primary">${existingProposal.proposed_rate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Timeline</span>
                  <span className="text-text-primary">{existingProposal.estimated_timeline}</span>
                </div>
              </div>
            ) : !showProposalForm && (
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-text-primary">Payment Verified</p>
                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <span className="text-text-secondary text-xs ml-1 font-medium">(4.9)</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary text-lg font-tenor font-bold uppercase">
                  O
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-border text-sm">
                <div>
                  <p className="text-text-muted text-xs mb-0.5">Location</p>
                  <p className="font-medium text-text-primary flex items-center gap-1">
                    <MapPin size={12} className="text-text-secondary" />
                    {project.client?.country || 'Hidden'}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-xs mb-0.5">Projects Paid</p>
                  <p className="font-medium text-text-primary">4 Projects</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs mb-0.5">Total Spent</p>
                  <p className="font-medium text-text-primary">{formatCurrency(900, project.client?.country)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs mb-0.5">Feedback Rate</p>
                  <p className="font-medium text-text-primary">93%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-muted text-xs mb-0.5">Client Type</p>
                  <p className="font-medium text-text-primary">Individual</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-muted text-center">Member since 15 Feb, 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
