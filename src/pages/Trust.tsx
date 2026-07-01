import { Shield, Lock, UserCheck, Scale, AlertTriangle, LifeBuoy } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Trust() {
  const pillars = [
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Stripe-Backed Escrow",
      description: "All payments are held securely in a Stripe Connect escrow account. Funds are only released when both parties agree the milestone is successfully completed."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-accent" />,
      title: "Identity Verification",
      description: "We enforce strict KYC (Know Your Customer) policies. Every freelancer and client goes through an identity check to keep bad actors off our platform."
    },
    {
      icon: <Lock className="w-8 h-8 text-accent" />,
      title: "Data Encryption",
      description: "Your intellectual property, project details, and messages are secured using enterprise-grade end-to-end encryption. Your data belongs to you."
    },
    {
      icon: <Scale className="w-8 h-8 text-accent" />,
      title: "Fair Dispute Resolution",
      description: "In the rare event of a disagreement, our unbiased dispute resolution team steps in to review the evidence and mediate a fair outcome."
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 text-center border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 text-accent">
            <Shield size={40} />
          </div>
          <h1 className="font-tenor text-4xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            Your security is our foundation.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Built for peace of mind. We take fraud, data security, and financial protection seriously so you can focus on doing great work.
          </p>
        </div>
      </section>

      {/* Core Pillars Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">The Four Pillars of Trust</h2>
          <p className="text-text-secondary text-lg">How we protect every transaction on Worklin_.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shrink-0">
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl text-text-primary mb-3">{pillar.title}</h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive: Escrow */}
      <section className="py-24 px-6 bg-primary text-white border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-tenor font-bold mb-4">How Escrow Protects You</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Our financial infrastructure ensures that no one is ever left out of pocket.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="font-tenor font-bold text-2xl mb-4 text-accent">For Clients</h3>
              <ul className="space-y-4 text-white/80">
                <li className="flex gap-3">
                  <CheckIcon /> You never pay for incomplete or subpar work.
                </li>
                <li className="flex gap-3">
                  <CheckIcon /> Funds are locked safely in escrow while the freelancer works.
                </li>
                <li className="flex gap-3">
                  <CheckIcon /> You hold the power to approve the final deliverable before funds are released.
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="font-tenor font-bold text-2xl mb-4 text-accent">For Freelancers</h3>
              <ul className="space-y-4 text-white/80">
                <li className="flex gap-3">
                  <CheckIcon /> You never work for free or chase unpaid invoices.
                </li>
                <li className="flex gap-3">
                  <CheckIcon /> You can clearly see that the client has deposited funds before you begin coding.
                </li>
                <li className="flex gap-3">
                  <CheckIcon /> Guaranteed payouts once the agreed-upon milestone is delivered.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Zero Tolerance */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-6">Zero Tolerance Policy</h2>
        <div className="bg-surface p-8 rounded-2xl border border-border text-left">
          <p className="text-text-secondary leading-relaxed mb-4">
            To maintain a high-quality, professional environment, we strictly enforce a zero-tolerance policy against:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-primary font-medium mb-6 ml-2">
            <li>Off-platform payment solicitation</li>
            <li>Harassment or abusive language</li>
            <li>Fraudulent portfolio claims or identity misrepresentation</li>
            <li>Spamming or inappropriate project postings</li>
          </ul>
          <p className="text-sm text-text-muted">
            Violations result in immediate, permanent account suspension and forfeiture of any pending unescrowed payouts.
          </p>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-20 px-6 text-center border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto">
          <LifeBuoy className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-tenor font-bold text-text-primary mb-4">Need to report an issue?</h2>
          <p className="text-lg text-text-secondary mb-8">
            Our Trust & Safety team is available 24/7 to review reports and mediate disputes.
          </p>
          <Button size="lg" variant="outline" className="bg-white">
            Contact Support
          </Button>
        </div>
      </section>
      
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent mt-0.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  );
}
