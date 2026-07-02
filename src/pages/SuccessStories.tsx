import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { Star, TrendingUp, Quote, Briefcase, ArrowRight } from 'lucide-react';

export function SuccessStories() {
  const { openAuthModal } = useUiStore();

  const caseStudies = [
    {
      client: "FinTech Innovators LLC",
      freelancer: "Alex Chen, Senior React Developer",
      industry: "Financial Technology",
      challenge: "Needed to accelerate their MVP launch timeframe by 3 months to secure seed funding, but lacked in-house frontend expertise.",
      solution: "Hired a vetted React developer on Worklin_ within 48 hours. Used our secure milestones to manage a 6-week sprint.",
      result: "MVP launched 2 weeks ahead of the new schedule. Secured $1.5M in seed funding.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      client: "EcoStyle E-Commerce",
      freelancer: "Sarah Jenkins, UX/UI Designer",
      industry: "Retail & E-commerce",
      challenge: "Their Shopify store had a 70% cart abandonment rate due to a confusing mobile checkout experience.",
      solution: "Found a specialized UX designer with e-commerce expertise on Worklin_. Redesigned the entire mobile flow.",
      result: "Cart abandonment dropped to 35%, resulting in a 120% increase in monthly revenue.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      client: "Global SaaS Solutions",
      freelancer: "David Kim, DevOps Engineer",
      industry: "B2B Software",
      challenge: "Server costs were spiraling out of control and frequent downtimes were affecting enterprise clients.",
      solution: "Hired an AWS-certified DevOps expert to migrate and optimize their cloud infrastructure using Worklin_'s escrow.",
      result: "Reduced AWS costs by 45% and achieved 99.99% uptime over the next 6 months.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const testimonials = [
    {
      quote: "Worklin_ completely changed how we scale our agency. The escrow system means we never worry about compliance, and the talent quality is unmatched.",
      author: "Marcus T., Agency Owner",
      role: "Client"
    },
    {
      quote: "I've doubled my freelance income since joining. Knowing my payments are secured in escrow before I start working gives me complete peace of mind.",
      author: "Elena R., Full-Stack Developer",
      role: "Freelancer"
    },
    {
      quote: "The ability to upgrade my subscription and lower my platform fees to just 3% makes Worklin_ the most profitable platform I've ever used.",
      author: "James L., UI Designer",
      role: "Freelancer"
    },
    {
      quote: "We hired our lead marketing consultant through Worklin_. The process was incredibly smooth from contract to final payment.",
      author: "Priya S., Startup Founder",
      role: "Client"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 text-center border-b border-border bg-primary text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">Success Stories</p>
          <h1 className="font-tenor text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Real work. Real growth.
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Read how businesses are scaling faster and top independent professionals are building thriving careers on Worklin_.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 px-6 border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="py-4">
            <h3 className="text-4xl font-bold text-text-primary mb-2">$2M+</h3>
            <p className="text-text-secondary text-sm uppercase tracking-wider">Earned securely via Escrow</p>
          </div>
          <div className="py-4">
            <h3 className="text-4xl font-bold text-text-primary mb-2">10,000+</h3>
            <p className="text-text-secondary text-sm uppercase tracking-wider">Projects Completed</p>
          </div>
          <div className="py-4">
            <h3 className="text-4xl font-bold text-text-primary mb-2">4.9/5</h3>
            <p className="text-text-secondary text-sm uppercase tracking-wider">Average Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">Featured Case Studies</h2>
          <p className="text-text-secondary text-lg">Deep dives into complex challenges solved by Worklin_ talent.</p>
        </div>
        
        <div className="space-y-16">
          {caseStudies.map((study, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
              <div className={`h-full min-h-[300px] ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <img src={study.image} alt={study.industry} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 bg-surface rounded-full text-text-secondary">{study.industry}</span>
                </div>
                <h3 className="font-tenor font-bold text-2xl text-text-primary mb-2">{study.client}</h3>
                <p className="text-accent font-medium mb-8">Hired: {study.freelancer}</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-text-primary flex items-center gap-2 mb-2">
                      <TrendingUp size={18} className="text-text-muted" /> The Challenge
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary flex items-center gap-2 mb-2">
                      <Briefcase size={18} className="text-text-muted" /> The Solution
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{study.solution}</p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <h4 className="font-bold text-accent flex items-center gap-2 mb-2">
                      <Star size={18} /> The Result
                    </h4>
                    <p className="text-text-primary font-medium text-sm leading-relaxed">{study.result}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Wall */}
      <section className="py-24 px-6 bg-surface border-t border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-4">What Our Community Says</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col h-full">
                <Quote className="text-accent mb-4 opacity-50" size={32} />
                <p className="text-text-secondary leading-relaxed mb-6 grow text-sm">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-text-primary">{t.author}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-tenor font-bold text-text-primary mb-6">Write your own success story</h2>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
          Whether you're a business looking to scale, or a professional looking for secure, rewarding work—your journey starts here.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')} className="px-8 flex items-center justify-center gap-2">
            Post a Project <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="outline" onClick={() => openAuthModal('signup', 'freelancer')} className="px-8 flex items-center justify-center gap-2 bg-white">
            Apply as Freelancer <ArrowRight size={18} />
          </Button>
        </div>
      </section>
      
    </div>
  );
}
