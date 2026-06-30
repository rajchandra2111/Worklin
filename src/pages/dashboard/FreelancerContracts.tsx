import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Clock, CheckCircle, DollarSign, MessageSquare, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SubmitWorkModal } from '../../components/contracts/SubmitWorkModal';

type TabType = 'active' | 'in_review' | 'completed' | 'cancelled';

export function FreelancerContracts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  
  // Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('freelancer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const projectIds = [...new Set(data.map(c => c.project_id))];
        const { data: projectsData } = await supabase.from('projects').select('id, title').in('id', projectIds);
        
        const clientIds = [...new Set(data.map(c => c.client_id))];
        const { data: clientsData } = await supabase.from('client_profiles').select('id, full_name, company_name, username').in('id', clientIds);
        
        data.forEach(c => {
          c.project = projectsData?.find(p => p.id === c.project_id);
          c.client = clientsData?.find(cl => cl.id === c.client_id);
        });
      }
      
      setContracts(data || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (notes: string) => {
    if (!selectedContract) return;
    
    const { error } = await supabase
      .from('contracts')
      .update({
        work_submitted_at: new Date().toISOString(),
        submission_notes: notes
      })
      .eq('id', selectedContract.id);
      
    if (error) throw error;
    
    // Refresh contracts list silently
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('freelancer_id', user?.id)
      .order('created_at', { ascending: false });
      
    if (data && data.length > 0) {
      const projectIds = [...new Set(data.map(c => c.project_id))];
      const { data: projectsData } = await supabase.from('projects').select('id, title').in('id', projectIds);
      
      const clientIds = [...new Set(data.map(c => c.client_id))];
      const { data: clientsData } = await supabase.from('client_profiles').select('id, full_name, company_name, username').in('id', clientIds);
      
      data.forEach(c => {
        c.project = projectsData?.find(p => p.id === c.project_id);
        c.client = clientsData?.find(cl => cl.id === c.client_id);
      });
      setContracts(data);
    }
    
    // Switch to in_review tab automatically
    setActiveTab('in_review');
  };

  const openSubmitModal = (contract: any) => {
    setSelectedContract(contract);
    setIsSubmitModalOpen(true);
  };

  const activeContracts = contracts.filter(c => c.status === 'active' && !c.work_submitted_at);
  const inReviewContracts = contracts.filter(c => c.status === 'active' && c.work_submitted_at);
  const completedContracts = contracts.filter(c => c.status === 'completed');
  const cancelledContracts = contracts.filter(c => c.status === 'cancelled');

  const getFilteredContracts = () => {
    switch (activeTab) {
      case 'active': return activeContracts;
      case 'in_review': return inReviewContracts;
      case 'completed': return completedContracts;
      case 'cancelled': return cancelledContracts;
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
      <div className="mb-8">
        <h1 className="text-[28px] font-tenor font-bold mb-2">My Contracts</h1>
        <p className="text-text-secondary">Manage your active projects, submit deliverables, and track completions.</p>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">Active</div>
            <div className="text-2xl font-bold font-tenor">{activeContracts.length}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">In Review</div>
            <div className="text-2xl font-bold font-tenor">{inReviewContracts.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-sm text-text-secondary font-medium">Completed</div>
            <div className="text-2xl font-bold font-tenor">{completedContracts.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'active' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Active ({activeContracts.length})
        </button>
        <button
          onClick={() => setActiveTab('in_review')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'in_review' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Pending Review ({inReviewContracts.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'completed' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Completed ({completedContracts.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'cancelled' 
              ? 'border-accent text-accent' 
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
        >
          Cancelled ({cancelledContracts.length})
        </button>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {getFilteredContracts().length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-border shadow-sm text-center">
            <Briefcase size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No contracts found</h3>
            <p className="text-text-secondary">You don't have any contracts in this status.</p>
          </div>
        ) : (
          getFilteredContracts().map((contract) => (
            <div key={contract.id} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Left Col: Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/project/${contract.project_id}`} className="text-xl font-bold font-tenor text-text-primary hover:text-accent transition-colors block mb-2 truncate">
                    {contract.project?.title || 'Unknown Project'}
                  </Link>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-text-secondary">Client:</span>
                    <Link 
                      to={`/client/profile/${contract.client?.username || contract.client?.id}`} 
                      className="text-sm font-medium text-text-primary hover:text-accent"
                    >
                      {contract.client?.company_name || contract.client?.full_name || 'Unknown Client'}
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                      <DollarSign size={14} />
                      <span className="font-semibold text-text-primary">€{contract.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                      <Clock size={14} />
                      <span>Started: {new Date(contract.start_date).toLocaleDateString()}</span>
                    </div>
                    {contract.work_submitted_at && (
                      <div className="flex items-center gap-1.5 text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Submitted: {new Date(contract.work_submitted_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Submission notes preview if in review */}
                  {activeTab === 'in_review' && contract.submission_notes && (
                    <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Submission Notes</h4>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{contract.submission_notes}</p>
                    </div>
                  )}
                </div>

                {/* Right Col: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  {activeTab === 'active' && (
                    <>
                      <Button onClick={() => openSubmitModal(contract)} className="w-full md:w-auto">
                        <Send size={16} />
                        Submit Work
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/freelancer/messages')} className="w-full md:w-auto">
                        <MessageSquare size={16} />
                        Message Client
                      </Button>
                    </>
                  )}
                  
                  {activeTab === 'in_review' && (
                    <>
                      <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md text-sm font-medium mb-2 border border-amber-200">
                        Pending Client Approval
                      </div>
                      <Button variant="outline" onClick={() => navigate('/freelancer/messages')} className="w-full md:w-auto">
                        <MessageSquare size={16} />
                        Message Client
                      </Button>
                    </>
                  )}

                  {activeTab === 'completed' && (
                    <>
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium mb-2 border border-green-200">
                        Paid & Completed
                      </div>
                      <Button variant="outline" onClick={() => navigate('/freelancer/reviews')} className="w-full md:w-auto">
                        <CheckCircle size={16} />
                        View Reviews
                      </Button>
                    </>
                  )}

                  {activeTab === 'cancelled' && (
                    <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium border border-red-200">
                      Contract Cancelled
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>

      <SubmitWorkModal 
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitWork}
        contractTitle={selectedContract?.project?.title}
      />
    </div>
  );
}
