import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DollarSign, Wallet, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function FreelancerEarnings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  
  // Metrics
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [escrowFunds, setEscrowFunds] = useState(0);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Profile (to check stripe_account_id)
      const { data: prof, error: profError } = await supabase
        .from('freelancer_profiles')
        .select('stripe_account_id')
        .eq('id', user?.id)
        .single();
        
      if (profError) throw profError;
      setProfile(prof);

      // 2. Get Payments
      const { data: pay, error: payError } = await supabase
        .from('payments')
        .select(`
          *,
          contracts (
            id,
            projects (title)
          )
        `)
        .eq('freelancer_id', user?.id)
        .order('created_at', { ascending: false });

      if (payError) throw payError;
      
      setPayments(pay || []);

      // Calculate Metrics
      let earned = 0;
      let escrow = 0;
      
      pay?.forEach(p => {
        if (p.status === 'released') earned += p.net_amount;
        if (p.status === 'escrowed') escrow += p.net_amount;
      });

      setTotalEarnings(earned);
      setEscrowFunds(escrow);

    } catch (err) {
      console.error('Error fetching earnings data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
      alert('Failed to initialize Stripe connection.');
    } finally {
      setConnecting(false);
    }
  };

  const handleLoginToStripe = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // --- NOT CONNECTED STATE ---
  if (!profile?.stripe_account_id) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-tenor font-bold mb-8">Financial Overview</h1>
        
        <div className="bg-white border border-border rounded-xl p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Set up payouts to get paid</h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Worklin partners with Stripe for fast, secure payments. You need to connect a bank account before you can receive funds from clients.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto px-12"
            onClick={handleConnectStripe}
            disabled={connecting}
          >
            {connecting ? 'Redirecting to Stripe...' : 'Connect Bank Account'}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-text-muted">
            <ShieldCheck size={16} /> Secured by Stripe
          </div>
        </div>
      </div>
    );
  }

  // --- CONNECTED DASHBOARD STATE ---
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-tenor font-bold">Earnings & Payouts</h1>
        <Button variant="outline" onClick={handleLoginToStripe} disabled={connecting} className="flex items-center gap-2">
          View Stripe Dashboard <ExternalLink size={16} />
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="font-semibold tracking-wide uppercase text-xs">Available Earnings</span>
          </div>
          <div className="text-4xl font-bold text-text-primary mb-1">
            ${totalEarnings.toFixed(2)}
          </div>
          <p className="text-sm text-text-muted">Total funds released to your account</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary mb-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <span className="font-semibold tracking-wide uppercase text-xs">In Escrow</span>
          </div>
          <div className="text-4xl font-bold text-text-primary mb-1">
            ${escrowFunds.toFixed(2)}
          </div>
          <p className="text-sm text-text-muted">Secured funds awaiting client approval</p>
        </div>
      </div>

      {/* Transaction History */}
      <h2 className="text-xl font-bold mb-6">Transaction History</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            No transactions yet. Start winning projects to see your earnings here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 border-b border-border">
                  <th className="p-4 font-semibold text-sm text-text-secondary">Date</th>
                  <th className="p-4 font-semibold text-sm text-text-secondary">Project</th>
                  <th className="p-4 font-semibold text-sm text-text-secondary">Amount</th>
                  <th className="p-4 font-semibold text-sm text-text-secondary">Fees</th>
                  <th className="p-4 font-semibold text-sm text-text-secondary">Net Earnings</th>
                  <th className="p-4 font-semibold text-sm text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface/30 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {payment.contracts?.projects?.title || 'Unknown Project'}
                    </td>
                    <td className="p-4 text-sm whitespace-nowrap">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-red-600 whitespace-nowrap">
                      -${payment.platform_fee.toFixed(2)}
                    </td>
                    <td className="p-4 font-bold text-green-600 whitespace-nowrap">
                      ${payment.net_amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {payment.status === 'released' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Released
                        </span>
                      ) : payment.status === 'escrowed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          In Escrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-text-secondary">
                          {payment.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
