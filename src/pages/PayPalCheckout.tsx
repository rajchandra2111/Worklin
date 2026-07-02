import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export function PayPalCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const proposalId = searchParams.get('proposal_id');
  const type = searchParams.get('type') || 'deposit'; // 'deposit' or 'final'
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState(0);
  const [country, setCountry] = useState('USA');
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    fetchDetails();
  }, [proposalId, type]);

  const fetchDetails = async () => {
    if (!proposalId) return navigate('/client/dashboard');
    try {
      // Get proposal details
      const { data: proposal } = await supabase
        .from('proposals')
        .select('*, project:projects(client_id, client:client_profiles(country))')
        .eq('id', proposalId)
        .single();
        
      if (proposal) {
        setCountry(proposal.project?.client?.country || 'USA');
        
        if (type === 'deposit') {
          setAmount(proposal.deposit_required || 0);
        } else {
          // Final payment: total - deposit
          setAmount(proposal.proposed_rate - (proposal.deposit_required || 0));
        }

        // Try to find the contract
        const { data: contract } = await supabase
          .from('contracts')
          .select('id')
          .eq('proposal_id', proposalId)
          .single();
          
        if (contract) setContractId(contract.id);
      }
    } catch (err) {
      console.error('Error fetching details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      if (type === 'deposit') {
        // If contract doesn't exist yet, we should call accept_proposal first
        // But since accept_proposal creates the contract in pending_funding state, we should have called it BEFORE coming here.
        if (contractId) {
          await supabase
            .from('contracts')
            .update({ status: 'active', escrow_funded: true })
            .eq('id', contractId);
        }
      } else {
        // Final payment
        if (contractId) {
          await supabase
            .from('contracts')
            .update({ status: 'completed', remaining_balance_paid: true })
            .eq('id', contractId);
        }
      }
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));
      
      // Success, go back
      navigate('/client/dashboard');
    } catch (err) {
      console.error(err);
      alert('Payment failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
      <div className="bg-[#003087] p-6 text-center">
        <h1 className="text-white text-2xl font-bold tracking-tight italic">PayPal</h1>
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-2 text-text-secondary mb-6 cursor-pointer hover:text-text-primary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Cancel and return to Worklin
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-text-secondary mb-1">
            {type === 'deposit' ? 'SafePay Deposit Escrow' : 'Final Project Payment'}
          </p>
          <p className="text-4xl font-bold text-text-primary">
            {formatCurrency(amount, country)}
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 mb-8 text-sm text-text-secondary flex gap-3 border border-border">
          <ShieldCheck size={24} className="text-green-600 shrink-0" />
          <p>
            {type === 'deposit' 
              ? "Your funds will be securely held in SafePay escrow until you approve the final work."
              : "This will release the final payment and the initial escrow deposit to the freelancer."}
          </p>
        </div>

        <Button 
          variant="primary" 
          className="w-full py-4 text-lg bg-[#0070ba] hover:bg-[#003087] border-none font-semibold rounded-full" 
          onClick={handleSimulatePayment}
          disabled={processing}
        >
          {processing ? <Loader2 className="animate-spin mx-auto" /> : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
}
