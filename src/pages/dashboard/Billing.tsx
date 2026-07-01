import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { CreditCard, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Billing() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchBillingData = async () => {
      try {
        // Fetch active subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
          
        if (subError) throw subError;
        setSubscription(subData);

        // Fetch billing history (invoices)
        const { data: historyData, error: historyError } = await supabase
          .from('billing_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (historyError) throw historyError;
        setBillingHistory(historyData || []);

        // Calculate Usage Count based on active plan's billing cycle, or fallback to start of month
        let periodStart = new Date();
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        
        if (subData?.current_period_start) {
          periodStart = new Date(subData.current_period_start);
        }

        if (role === 'client') {
          const { count, error: countError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', user.id)
            .gte('created_at', periodStart.toISOString());
            
          if (!countError && count !== null) setUsageCount(count);
        } else if (role === 'freelancer') {
          const { count, error: countError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('freelancer_id', user.id)
            .gte('created_at', periodStart.toISOString());
            
          if (!countError && count !== null) setUsageCount(count);
        }

      } catch (err) {
        console.error('Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user, role]);

  const handleManageStripe = () => {
    // In the future, this will call a Supabase Edge function that creates a Stripe Customer Portal session.
    alert("This will open the secure Stripe Customer Portal where you can update your payment method or cancel your plan.");
  };

  if (loading) return <div className="p-8 text-text-secondary">Loading billing information...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-tenor font-bold text-text-primary mb-2">Billing & Plans</h1>
        <p className="text-text-secondary">Manage your subscription, payment methods, and billing history.</p>
      </div>

      {/* Current Plan Section */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Current Plan</h2>
            <div className="flex items-center gap-2 mt-2">
              {subscription ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium capitalize">{subscription.plan_tier} Plan</span>
                  <span className="text-text-secondary text-sm ml-2">
                    (Renews {new Date(subscription.current_period_end).toLocaleDateString()})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">Basic (Free) Plan</span>
                </>
              )}
            </div>
          </div>
          <div>
            {!subscription ? (
              <Button onClick={() => navigate(`/${role}/pricing`)} variant="primary">
                Upgrade Plan
              </Button>
            ) : (
              <Button onClick={handleManageStripe} variant="outline" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </Button>
            )}
          </div>
        </div>

        {/* Usage / Limits */}
        <div className="p-6 bg-surface/50">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Monthly Usage Limits</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {role === 'client' ? 'Projects Posted This Cycle' : 'Proposals Submitted This Cycle'}
                </span>
                <span className="font-medium text-text-primary">
                  {(() => {
                    const planTier = subscription?.plan_tier || 'basic';
                    let limit = 0;
                    if (role === 'client') {
                      limit = planTier === 'enterprise' || planTier === 'premium' ? -1 : (planTier === 'plus' ? -1 : 3);
                    } else {
                      limit = planTier === 'premium' || planTier === 'enterprise' ? -1 : (planTier === 'pro' ? 50 : 15);
                    }
                    
                    if (limit === -1) {
                      return `${usageCount} / Unlimited`;
                    }
                    
                    return (
                      <>{usageCount} / {limit}</>
                    );
                  })()}
                </span>
              </div>
              
              {(() => {
                const planTier = subscription?.plan_tier || 'basic';
                let limit = 0;
                if (role === 'client') {
                  limit = planTier === 'enterprise' || planTier === 'premium' ? -1 : (planTier === 'plus' ? -1 : 3); // Plus has unlimited projects! Basic has 3.
                } else {
                  limit = planTier === 'premium' || planTier === 'enterprise' ? -1 : (planTier === 'pro' ? 50 : 15);
                }
                
                if (limit === -1) return null; // No progress bar for unlimited
                
                const percentage = Math.min(100, Math.round((usageCount / limit) * 100));
                
                return (
                  <div className="w-full bg-border rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-accent'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Billing History
        </h2>
        
        {billingHistory.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No billing history found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-4 border border-border rounded-xl">
                <div>
                  <p className="font-medium text-text-primary">{new Date(invoice.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-text-secondary">Invoice #{invoice.provider_invoice_id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">${invoice.amount} {invoice.currency}</span>
                  <a href={invoice.invoice_pdf_url} target="_blank" rel="noreferrer" className="text-accent text-sm font-medium hover:underline">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
