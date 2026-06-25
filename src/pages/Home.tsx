import { useUiStore } from '../store/uiStore';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Monitor, Palette, TrendingUp, PenTool, BarChart3, Video, Scale, Headphones, ShieldCheck, BadgeCheck, MessageSquare, Zap, Globe, ShieldAlert, ClipboardList, CreditCard, Settings, CheckCircle2, PartyPopper } from 'lucide-react';

export function Home() {
  const { openAuthModal } = useUiStore();
  const { user, role, isLoading } = useAuth();

  // If Auth is still loading on initial visit, we can either wait or show the page.
  // Wait prevents a flash of the landing page before redirecting.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // If user is already logged in, send them to their dashboard
  if (user) {
    if (role) {
      return <Navigate to={`/${role}/dashboard`} replace />;
    } else if (user.user_metadata?.role) {
      return <Navigate to={`/${user.user_metadata.role}/dashboard`} replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <div>
      {/* HERO */}
      <div className="relative overflow-hidden text-white pt-[88px] px-6 pb-[72px]">
        {/* Animated Background Image */}
        <div className="absolute inset-0 z-0 bg-primary">
          <img src="/hero-bg.png" alt="People working" className="w-full h-full object-cover animate-ken-burns opacity-60" />
          <div className="absolute inset-0 bg-linear-to-br from-primary/95 via-primary/70 to-primary/90"></div>
          <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 border border-white/10 px-3.5 py-1.5 rounded-pill mb-5">
              For clients
            </div>
            <h1 className="text-4xl md:text-5xl font-tenor font-normal uppercase tracking-[0.08em] leading-[1.1] mb-4">
              Hire the <em className="not-italic text-accent-light">right</em> expert, every time
            </h1>
            <p className="text-base text-white/60 leading-[1.7] mb-[30px] max-w-[460px]">
              Post a project, receive bids from vetted professionals, and pay only when you're satisfied. Thousands of clients trust <span className="font-tenor font-semibold tracking-tight">Worklin_</span> every day.
            </p>
            <div className="flex flex-wrap gap-3 mb-9">
              <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>
                Post a project — it's free
              </Button>
              <a 
                href="#browse-freelancers" 
                className="inline-flex items-center justify-center gap-1.5 font-medium rounded-pill transition-all duration-150 border outline-none cursor-pointer text-base px-[28px] py-[13px] bg-white/10 text-white border-white/20 hover:bg-white/20 no-underline"
              >
                Browse freelancers
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {[
                'Free to post',
                'Secure escrow',
                'Verified freelancers',
                '24/7 support'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-white/50">
                  <div className="w-[18px] h-[18px] rounded-full bg-success/20 flex items-center justify-center text-[10px] text-success">
                    ✓
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          {/* Post project preview */}
          <div className="bg-white rounded-xl p-8 shadow-[0_16px_60px_rgba(0,0,0,0.3)] text-text-primary">
            <h3 className="text-base font-semibold mb-1">Post your project</h3>
            <p className="text-[13px] text-text-muted mb-5">Describe what you need and get bids within hours</p>
            
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-text-secondary mb-1">Project title</label>
              <input type="text" placeholder="e.g. Build a React dashboard with auth" className="w-full p-[9px] px-3 border-[1.5px] border-border rounded-md font-inherit text-[13px] text-text-primary outline-none focus:border-accent" />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select className="w-full p-[9px] px-3 border-[1.5px] border-border rounded-md font-inherit text-[13px] text-text-primary outline-none focus:border-accent bg-white">
                <option>Development & Tech</option>
                <option>Design & Creative</option>
                <option>Marketing & Growth</option>
                <option>Writing & Content</option>
                <option>Finance & Accounting</option>
              </select>
            </div>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-text-secondary mb-1">Describe your project</label>
              <textarea placeholder="What do you need done? Be as specific as possible..." className="w-full p-[9px] px-3 border-[1.5px] border-border rounded-md font-inherit text-[13px] text-text-primary outline-none resize-none h-20 focus:border-accent" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-1">
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-text-secondary mb-1">Budget from (€)</label>
                <input type="number" placeholder="500" className="w-full p-[9px] px-3 border-[1.5px] border-border rounded-md font-inherit text-[13px] text-text-primary outline-none focus:border-accent" />
              </div>
              <div className="mb-3.5">
                <label className="block text-xs font-medium text-text-secondary mb-1">Budget to (€)</label>
                <input type="number" placeholder="2000" className="w-full p-[9px] px-3 border-[1.5px] border-border rounded-md font-inherit text-[13px] text-text-primary outline-none focus:border-accent" />
              </div>
            </div>
            <button 
              className="w-full p-3 border-none rounded-md bg-accent text-white font-inherit text-sm font-semibold cursor-pointer mt-1 transition-colors hover:bg-accent-light"
              onClick={() => openAuthModal('signup', 'client')}
            >
              Post project & get bids →
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-9 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">Explore skills</p>
              <h2 className="text-[34px] font-tenor font-bold leading-[1.2] mb-3.5">Find talent by category</h2>
            </div>
            <Button variant="ghost">All categories →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { icon: Monitor, n: 'Development & Tech', c: '8,240' },
              { icon: Palette, n: 'Design & Creative', c: '5,180' },
              { icon: TrendingUp, n: 'Marketing & Growth', c: '3,920' },
              { icon: PenTool, n: 'Writing & Content', c: '4,670' },
              { icon: BarChart3, n: 'Finance & Accounting', c: '1,840' },
              { icon: Video, n: 'Video & Animation', c: '2,310' },
              { icon: Scale, n: 'Legal & Compliance', c: '890' },
              { icon: Headphones, n: 'Sales & Support', c: '1,560' },
            ].map((cat, idx) => (
              <div 
                key={idx} 
                className="border border-border rounded-lg p-5 cursor-pointer transition-all duration-200 bg-surface hover:border-accent hover:shadow-float hover:-translate-y-0.5 hover:bg-white"
                onClick={() => openAuthModal('signup', 'client')}
              >
                <cat.icon className="w-7 h-7 mb-3.5 text-primary" strokeWidth={1.5} />
                <div className="text-sm font-semibold mb-1">{cat.n}</div>
                <div className="text-xs text-text-muted">{cat.c} available</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FREELANCERS */}
      <section id="browse-freelancers" className="bg-surface py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-9 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">Top talent</p>
              <h2 className="text-[34px] font-tenor font-bold leading-[1.2] mb-3.5">Browse expert freelancers</h2>
              <p className="text-[15px] text-text-secondary max-w-[500px] mb-0 leading-[1.65]">Click any profile to view full details. Sign up to get in touch.</p>
            </div>
            <Button variant="ghost" onClick={() => openAuthModal('signup', 'client')}>See all freelancers →</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { initials: 'JK', bgClass: 'bg-accent', name: 'James Kim', role: 'Full-Stack Developer · Berlin', rate: '€95/hr', rating: '4.9', reviews: '208', bio: 'React, Node.js, and PostgreSQL specialist. Builds scalable APIs and clean frontends. 6 years shipping production software.', tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'] },
              { initials: 'LP', bgClass: 'bg-accent-light', name: 'Lucia Perez', role: 'Brand Strategist · Madrid', rate: '€75/hr', rating: '4.8', reviews: '97', bio: 'Brand identity, positioning, and visual strategy for startups and scale-ups. Worked with clients across Europe and the US.', tags: ['Branding', 'Strategy', 'Identity', 'Naming'] }
            ].map((fl, i) => (
              <div key={i} className="bg-white border border-border rounded-lg p-6 transition-all duration-300 cursor-pointer hover:border-accent hover:shadow-card hover:-translate-y-1">
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0 ${fl.bgClass}`}>
                    {fl.initials}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{fl.name}</div>
                    <div className="text-[13px] text-text-muted mb-1">{fl.role}</div>
                    <span className="inline-flex bg-accent-dim text-accent text-xs font-semibold px-2.5 py-1 rounded-pill">{fl.rate}</span>
                  </div>
                </div>
                <div className="text-xs text-warning mb-2.5">
                  ★★★★★ {fl.rating} <span className="text-text-muted text-[11px]">({fl.reviews} reviews)</span>
                </div>
                <p className="text-[13px] text-text-secondary leading-[1.55] mb-3">{fl.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {fl.tags.map(t => <span key={t} className="text-[11px] px-2 py-1 rounded-pill bg-surface border border-border text-text-secondary">{t}</span>)}
                </div>
                <button 
                  className="w-full p-2.5 rounded-md font-inherit text-[13px] font-medium cursor-pointer border-[1.5px] border-accent bg-transparent text-accent transition-colors hover:bg-accent hover:text-white"
                  onClick={() => openAuthModal('signup', 'client')}
                >
                  Contact {fl.name.split(' ')[0]} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WORKLIN */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">Why clients choose us</p>
            <h2 className="text-[34px] font-tenor font-bold leading-[1.2] mb-3.5">Hire with complete confidence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { icon: ShieldCheck, t: 'Secure escrow payments', d: "Your money is held safely and only released when you've approved the final work. No risk of paying for nothing." },
              { icon: BadgeCheck, t: 'Verified professionals', d: "Every freelancer's identity and skills are verified. Real reviews from real clients. You see exactly who you're hiring." },
              { icon: MessageSquare, t: 'All communication in one place', d: "Chat, share files, and track progress directly in Worklin_. No need to juggle email, Slack, and Google Drive." },
              { icon: Zap, t: 'Bids arrive fast', d: "Post a project and typically receive your first bids within 30 minutes. Compare, shortlist, and hire the same day." },
              { icon: Globe, t: 'Global talent pool', d: "Access 48,000+ freelancers across 180 countries. Find the right expertise at the right price for your budget." },
              { icon: ShieldAlert, t: 'Dispute protection', d: "If something goes wrong, our team mediates and protects both parties. You're never left without recourse." }
            ].map((why, i) => (
              <div key={i} className="p-7 border border-border rounded-lg bg-surface">
                <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center text-primary mb-5 shadow-sm">
                  <why.icon size={24} strokeWidth={1.5} />
                </div>
                <div className="text-[15px] font-semibold mb-1.5">{why.t}</div>
                <div className="text-[13px] text-text-secondary leading-[1.6]">{why.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESCROW EXPLAINER */}
      <div className="bg-primary text-white py-20 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-[32px] font-tenor font-bold leading-[1.2] mb-3">How payment protection works</h2>
          <p className="text-white/60 mb-12 text-[15px]">Your money is never at risk. Here's exactly how escrow keeps every project safe.</p>
          
          <div className="flex flex-col md:flex-row gap-5 md:gap-0 relative">
            {[
              { icon: ClipboardList, t: 'Accept a bid', d: 'Choose the freelancer and agree on scope' },
              { icon: CreditCard, t: 'Fund escrow', d: 'Pay into the secure Worklin_ escrow account' },
              { icon: Settings, t: 'Work happens', d: 'Freelancer delivers, you chat and review' },
              { icon: CheckCircle2, t: 'Approve & release', d: 'Happy? Release funds. Not happy? Dispute.' },
              { icon: PartyPopper, t: 'Project done', d: 'Leave a review and close the project' }
            ].map((step, i, arr) => (
              <div key={i} className="flex-1 text-center relative group">
                <div className="w-12 h-12 rounded-full bg-accent/25 border border-accent/40 flex items-center justify-center mx-auto mb-4">
                  <step.icon size={20} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="text-sm font-semibold mb-1">{step.t}</div>
                <div className="text-xs text-white/50 leading-normal max-w-[180px] mx-auto">{step.d}</div>
                {i !== arr.length - 1 && (
                  <>
                    <div className="hidden md:block absolute top-[18px] -right-3 text-xl text-white/20">→</div>
                    <div className="md:hidden absolute -bottom-4 right-1/2 translate-x-1/2 text-xl text-white/20">↓</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="bg-surface py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">Client stories</p>
            <h2 className="text-[34px] font-tenor font-bold leading-[1.2] mb-3.5">What clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { q: `"We hired a React developer through Worklin_ and had production-ready code in 2 weeks. The escrow gave us peace of mind from day one."`, initials: 'MR', bgClass: 'bg-primary', n: 'Marco Rossi', co: 'CTO, Stackly' },
              { q: `"I posted a branding project and had 12 quality bids in the first hour. Found the perfect designer and the whole thing took 3 days."`, initials: 'AV', bgClass: 'bg-accent', n: 'Anna Visser', co: 'Founder, Plantr' },
              { q: `"The messaging and file sharing inside Worklin_ meant I never had to leave the platform. Incredibly smooth from first bid to final payment."`, initials: 'TK', bgClass: 'bg-accent-light', n: 'Tom Klein', co: 'Head of Product, Novarise' }
            ].map((test, i) => (
              <div key={i} className="bg-surface rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="text-warning text-[13px] mb-2.5">★★★★★</div>
                <p className="text-sm text-text-primary leading-[1.65] mb-4 italic">{test.q}</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0 ${test.bgClass}`}>
                    {test.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{test.n}</div>
                    <div className="text-xs text-text-muted">{test.co}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="bg-accent-dim py-20 px-6 text-center">
        <div className="max-w-[600px] mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">Get started today</p>
          <h2 className="text-[32px] font-tenor font-bold leading-[1.2] mb-2.5">Post your first project in 5 minutes</h2>
          <p className="text-[15px] text-text-secondary mb-7">Free to post. No subscription. Pay only when you hire.</p>
          <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>
            Post a project →
          </Button>
        </div>
      </div>
    </div>
  );
}
