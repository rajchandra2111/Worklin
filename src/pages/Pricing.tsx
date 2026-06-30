import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Check, Zap, Shield, Star, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Pricing() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [viewRole, setViewRole] = useState<'client' | 'freelancer'>(role || 'client');

  const plans = {
    client: [
      {
        name: 'Basic',
        price: 'Free',
        description: 'Perfect for individuals hiring for small projects.',
        features: [
          'Post up to 3 projects per month',
          'Invite up to 5 freelancers per project',
          '5% payment processing fee',
          'Standard support'
        ],
        icon: <Shield className="w-6 h-6 text-slate-400" />,
        cta: 'Get Started',
        variant: 'outline'
      },
      {
        name: 'Plus',
        price: billingCycle === 'monthly' ? '$29' : '$24',
        period: '/mo',
        description: 'For growing teams managing multiple active projects.',
        popular: true,
        features: [
          'Unlimited job postings',
          'Unlimited freelancer invites',
          'Highlighted "Urgent" job posts',
          'Reduced 3% payment fee',
          'Add up to 3 manager accounts'
        ],
        icon: <Zap className="w-6 h-6 text-accent" />,
        cta: 'Upgrade to Plus',
        variant: 'primary'
      },
      {
        name: 'Enterprise',
        price: billingCycle === 'monthly' ? '$99' : '$79',
        period: '/mo',
        description: 'Maximum scale, zero fees, and dedicated support.',
        features: [
          '0% platform payment fee',
          'Unlimited team members',
          'Dedicated Talent Manager',
          'Custom NDA enforcement',
          'Consolidated bulk invoicing'
        ],
        icon: <Star className="w-6 h-6 text-amber-400" />,
        cta: 'Contact Sales',
        variant: 'secondary'
      }
    ],
    freelancer: [
      {
        name: 'Basic',
        price: 'Free',
        description: 'For beginners building their portfolio.',
        features: [
          'Apply to 15 projects per month',
          'Standard profile visibility',
          '10% platform payout fee',
          'Community support'
        ],
        icon: <Shield className="w-6 h-6 text-slate-400" />,
        cta: 'Get Started',
        variant: 'outline'
      },
      {
        name: 'Pro',
        price: billingCycle === 'monthly' ? '$15' : '$12',
        period: '/mo',
        description: 'Stand out from the crowd and win more clients.',
        popular: true,
        features: [
          'Apply to 50 projects per month',
          '50 Connects/Credits included',
          'Reduced 8% platform fee',
          'See competitor bid ranges',
          '"Pro" profile badge'
        ],
        icon: <Zap className="w-6 h-6 text-accent" />,
        cta: 'Upgrade to Pro',
        variant: 'primary'
      },
      {
        name: 'Premium',
        price: billingCycle === 'monthly' ? '$39' : '$32',
        period: '/mo',
        description: 'For full-time professionals maximizing their income.',
        features: [
          'Unlimited applications',
          '150 Connects/Credits included',
          'Lowest 5% platform fee',
          'Featured profile placement',
          'Instant Escrow Payouts'
        ],
        icon: <Briefcase className="w-6 h-6 text-amber-400" />,
        cta: 'Upgrade to Premium',
        variant: 'secondary'
      }
    ]
  };

  const handleUpgrade = (planName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // TODO: Integrate Stripe Checkout
    alert(`Initiating Stripe checkout for ${planName} plan...`);
  };

  const currentPlans = plans[viewRole];

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-tenor text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            Whether you're hiring top talent or building your freelance empire, we have a plan designed to help you succeed.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="bg-surface p-1 rounded-full border border-border inline-flex">
              <button
                onClick={() => setViewRole('client')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewRole === 'client' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                For Clients
              </button>
              <button
                onClick={() => setViewRole('freelancer')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewRole === 'freelancer' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                For Freelancers
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-text-primary' : 'text-text-muted'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-accent rounded-full p-1 transition-colors duration-300 focus:outline-none"
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-text-primary' : 'text-text-muted'}`}>
              Yearly 
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                plan.popular ? 'border-accent shadow-lg md:scale-105 z-10' : 'border-border shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center mb-6">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <p className="text-sm text-text-secondary h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-tenor font-bold text-text-primary">{plan.price}</span>
                  {plan.period && <span className="text-text-secondary">{plan.period}</span>}
                </div>
              </div>

              <Button 
                variant={plan.variant as 'primary' | 'secondary' | 'outline'}
                className="w-full mb-8 h-12 text-[15px]"
                onClick={() => handleUpgrade(plan.name)}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4">What's included</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-sm text-text-secondary leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
