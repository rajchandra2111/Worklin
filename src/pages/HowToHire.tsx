import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { Search, FileText, ShieldCheck, CheckCircle } from 'lucide-react';

export function HowToHire() {
  const { openAuthModal } = useUiStore();

  const steps = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: '1. Post a Project',
      description: 'Define your scope, timeline, and budget. It’s completely free to post a project and start receiving proposals.'
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: '2. Review Proposals',
      description: 'Evaluate vetted freelancers by reviewing their past work, client ratings, and direct proposals.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: '3. Fund Escrow',
      description: 'Deposit funds securely into our Stripe-backed escrow. Work only begins when funds are locked in.'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: '4. Approve & Pay',
      description: 'Review the delivered work. Once you’re 100% satisfied, release the funds to the freelancer with one click.'
    }
  ];

  const faqs = [
    {
      q: 'How much does it cost to hire?',
      a: 'Posting a project is free. You only pay the agreed-upon project rate plus a small platform fee when you successfully fund escrow.'
    },
    {
      q: 'What if I am not satisfied with the work?',
      a: 'Funds are held in secure escrow and are only released when you approve the milestones. If disputes arise, our support team can help mediate.'
    },
    {
      q: 'How do taxes and legal compliance work?',
      a: 'All freelancers are bound by our strict Terms of Service. Invoices are automatically generated for your accounting records.'
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 text-center border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-tenor text-4xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            Find, hire, and pay top talent with zero friction.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Worklin_ provides the most secure and streamlined way to scale your business with elite freelance professionals.
          </p>
          <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')} className="px-8 py-4 text-lg">
            Post a Project Now
          </Button>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">How it works</h2>
          <p className="text-text-secondary text-lg">Your journey from an idea to a completed project.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center relative z-10">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="font-bold text-xl mb-3 text-text-primary">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Benefits */}
      <section className="py-24 px-6 bg-primary text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="font-tenor font-bold text-2xl mb-4 text-accent">Zero Risk Escrow</h3>
            <p className="text-white/70 leading-relaxed">
              Your capital is protected by Stripe Connect. Funds are only released when milestones are explicitly approved by you.
            </p>
          </div>
          <div>
            <h3 className="font-tenor font-bold text-2xl mb-4 text-accent">Dynamic Limits</h3>
            <p className="text-white/70 leading-relaxed">
              Scale your hiring up or down. Our flexible subscription tiers adapt to your exact business cycle needs.
            </p>
          </div>
          <div>
            <h3 className="font-tenor font-bold text-2xl mb-4 text-accent">Verified Talent</h3>
            <p className="text-white/70 leading-relaxed">
              Every freelancer on our platform has passed identity verification and agreed to strict compliance guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-border">
              <h4 className="font-bold text-lg mb-2 text-text-primary">{faq.q}</h4>
              <p className="text-text-secondary leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center border-t border-border bg-surface">
        <h2 className="text-3xl font-tenor font-bold text-text-primary mb-6">Ready to build your dream team?</h2>
        <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>
          Get Started Today
        </Button>
      </section>
      
    </div>
  );
}
