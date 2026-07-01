import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { Shield, Target, Users, ArrowRight } from 'lucide-react';

export function About() {
  const { openAuthModal } = useUiStore();

  const team = [
    {
      name: "Rajesh Chandra",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Sarah Chen",
      role: "Head of Engineering",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Trust & Safety",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 text-center border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-tenor text-4xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            We are building the future of independent work.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Fair, secure, and transparent. Worklin_ was founded to fix the broken gig economy and create a space where elite talent and great companies can thrive together.
          </p>
        </div>
      </section>

      {/* The Problem & Our Story */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-tenor font-bold text-text-primary mb-6">Why we started Worklin_</h2>
            <div className="space-y-6 text-text-secondary leading-relaxed">
              <p>
                For years, the freelance industry has been dominated by legacy platforms that charge extortionate fees, offer zero protection, and prioritize quantity over quality.
              </p>
              <p>
                We believed there had to be a better way. A way that treats freelancers as actual business partners rather than commodities, and provides clients with the absolute security of transparent, Stripe-backed escrow.
              </p>
              <p>
                Worklin_ was built by a team of frustrated freelancers and agency owners who decided to stop complaining and start building the platform they always wished existed.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Team collaborating" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 bg-primary text-white border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-tenor font-bold mb-4">Our Core Values</h2>
            <p className="text-white/70 text-lg">The principles that guide every feature we build.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                <Shield size={32} />
              </div>
              <h3 className="font-tenor font-bold text-2xl mb-4 text-white">Trust & Security</h3>
              <p className="text-white/70 leading-relaxed">
                We never compromise on security. From mandatory identity verification to our Stripe Connect escrow system, safety is our foundation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                <Target size={32} />
              </div>
              <h3 className="font-tenor font-bold text-2xl mb-4 text-white">Radical Fairness</h3>
              <p className="text-white/70 leading-relaxed">
                We offer the lowest, most transparent platform fees in the industry. We succeed only when our users succeed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                <Users size={32} />
              </div>
              <h3 className="font-tenor font-bold text-2xl mb-4 text-white">Quality Over Quantity</h3>
              <p className="text-white/70 leading-relaxed">
                We are not a race to the bottom. We focus on curating elite talent and connecting them with serious, high-intent clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">Meet the Team</h2>
          <p className="text-text-secondary text-lg">The people working tirelessly behind the scenes.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm group">
              <div className="aspect-4/5 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-text-primary mb-1">{member.name}</h3>
                <p className="text-accent font-medium text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-24 px-6 bg-surface border-t border-border text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-6">Ready to change how you work?</h2>
          <p className="text-lg text-text-secondary mb-10">
            Join thousands of professionals and businesses who have already discovered the Worklin_ difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')} className="px-8 flex items-center justify-center gap-2">
              Join as Client <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuthModal('signup', 'freelancer')} className="px-8 flex items-center justify-center gap-2 bg-white">
              Join as Freelancer <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
