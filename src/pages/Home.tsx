import { useUiStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';

export function Home() {
  const { openAuthModal } = useUiStore();

  return (
    <div>
      {/* HERO */}
      <div className="bg-linear-to-br from-[#0F0E24] to-[#1e1c3a] text-white pt-[88px] px-6 pb-[72px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 border border-white/10 px-3.5 py-1.5 rounded-pill mb-5">
              For clients
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
              Hire the <em className="not-italic text-accent-light">right</em> expert, every time
            </h1>
            <p className="text-base text-white/60 leading-[1.7] mb-[30px] max-w-[460px]">
              Post a project, receive bids from vetted professionals, and pay only when you're satisfied. Thousands of clients trust Worklin every day.
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
              <h2 className="text-[34px] font-extrabold tracking-tight leading-[1.2] mb-3.5">Find talent by category</h2>
            </div>
            <Button variant="ghost">All categories →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { i: '💻', n: 'Development & Tech', c: '8,240' },
              { i: '🎨', n: 'Design & Creative', c: '5,180' },
              { i: '📈', n: 'Marketing & Growth', c: '3,920' },
              { i: '✍️', n: 'Writing & Content', c: '4,670' },
              { i: '📊', n: 'Finance & Accounting', c: '1,840' },
              { i: '🎬', n: 'Video & Animation', c: '2,310' },
              { i: '⚖️', n: 'Legal & Compliance', c: '890' },
              { i: '🔊', n: 'Sales & Support', c: '1,560' },
            ].map((cat, idx) => (
              <div 
                key={idx} 
                className="border border-border rounded-lg p-5 cursor-pointer transition-all duration-200 bg-surface hover:border-accent hover:shadow-float hover:-translate-y-0.5 hover:bg-white"
                onClick={() => openAuthModal('signup', 'client')}
              >
                <div className="text-[26px] mb-2.5">{cat.i}</div>
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
              <h2 className="text-[34px] font-extrabold tracking-tight leading-[1.2] mb-3.5">Browse expert freelancers</h2>
              <p className="text-[15px] text-text-secondary max-w-[500px] mb-0 leading-[1.65]">Click any profile to view full details. Sign up to get in touch.</p>
            </div>
            <Button variant="ghost" onClick={() => openAuthModal('signup', 'client')}>See all freelancers →</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { initials: 'SM', bg: 'linear-gradient(135deg,#6C63FF,#A78BFA)', name: 'Sara Molin', role: 'UI/UX Designer · Amsterdam', rate: '€85/hr', rating: '5.0', reviews: '142', bio: 'Specialised in SaaS product design, design systems, and high-fidelity prototyping. 8 years experience with B2B products.', tags: ['Figma', 'Design Systems', 'Prototyping', 'SaaS'] },
              { initials: 'JK', bg: 'linear-gradient(135deg,#10B981,#34D399)', name: 'James Kim', role: 'Full-Stack Developer · Berlin', rate: '€95/hr', rating: '4.9', reviews: '208', bio: 'React, Node.js, and PostgreSQL specialist. Builds scalable APIs and clean frontends. 6 years shipping production software.', tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'] },
              { initials: 'LP', bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', name: 'Lucia Perez', role: 'Brand Strategist · Madrid', rate: '€75/hr', rating: '4.8', reviews: '97', bio: 'Brand identity, positioning, and visual strategy for startups and scale-ups. Worked with clients across Europe and the US.', tags: ['Branding', 'Strategy', 'Identity', 'Naming'] }
            ].map((fl, i) => (
              <div key={i} className="bg-white border border-border rounded-lg p-6 transition-all duration-200 cursor-pointer hover:border-accent hover:shadow-card hover:-translate-y-0.5">
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0" style={{ background: fl.bg }}>
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
            <h2 className="text-[34px] font-extrabold tracking-tight leading-[1.2] mb-3.5">Hire with complete confidence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { i: '🔒', t: 'Secure escrow payments', d: "Your money is held safely and only released when you've approved the final work. No risk of paying for nothing." },
              { i: '✅', t: 'Verified professionals', d: "Every freelancer's identity and skills are verified. Real reviews from real clients. You see exactly who you're hiring." },
              { i: '💬', t: 'All communication in one place', d: "Chat, share files, and track progress directly in Worklin. No need to juggle email, Slack, and Google Drive." },
              { i: '⚡', t: 'Bids arrive fast', d: "Post a project and typically receive your first bids within 30 minutes. Compare, shortlist, and hire the same day." },
              { i: '🌍', t: 'Global talent pool', d: "Access 48,000+ freelancers across 180 countries. Find the right expertise at the right price for your budget." },
              { i: '🛡️', t: 'Dispute protection', d: "If something goes wrong, our team mediates and protects both parties. You're never left without recourse." }
            ].map((why, i) => (
              <div key={i} className="p-7 border border-border rounded-lg bg-surface">
                <div className="text-[28px] mb-3.5">{why.i}</div>
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
          <h2 className="text-[32px] font-extrabold tracking-tight leading-[1.2] mb-3">How payment protection works</h2>
          <p className="text-white/60 mb-12 text-[15px]">Your money is never at risk. Here's exactly how escrow keeps every project safe.</p>
          
          <div className="flex flex-col md:flex-row gap-5 md:gap-0 relative">
            {[
              { i: '📋', t: 'Accept a bid', d: 'Choose the freelancer and agree on scope' },
              { i: '💳', t: 'Fund escrow', d: 'Pay into the secure Worklin escrow account' },
              { i: '⚙️', t: 'Work happens', d: 'Freelancer delivers, you chat and review' },
              { i: '✓', t: 'Approve & release', d: 'Happy? Release funds. Not happy? Dispute.' },
              { i: '🎉', t: 'Project done', d: 'Leave a review and close the project' }
            ].map((step, i, arr) => (
              <div key={i} className="flex-1 text-center relative group">
                <div className="w-10 h-10 rounded-full bg-accent/25 border border-accent/40 flex items-center justify-center text-base mx-auto mb-3">
                  {step.i}
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
            <h2 className="text-[34px] font-extrabold tracking-tight leading-[1.2] mb-3.5">What clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { q: `"We hired a React developer through Worklin and had production-ready code in 2 weeks. The escrow gave us peace of mind from day one."`, initials: 'MR', bg: '#6C63FF', n: 'Marco Rossi', co: 'CTO, Stackly' },
              { q: `"I posted a branding project and had 12 quality bids in the first hour. Found the perfect designer and the whole thing took 3 days."`, initials: 'AV', bg: '#10B981', n: 'Anna Visser', co: 'Founder, Plantr' },
              { q: `"The messaging and file sharing inside Worklin meant I never had to leave the platform. Incredibly smooth from first bid to final payment."`, initials: 'TK', bg: '#F59E0B', n: 'Tom Klein', co: 'Head of Product, Novarise' }
            ].map((test, i) => (
              <div key={i} className="bg-surface rounded-lg p-6 border border-border">
                <div className="text-warning text-[13px] mb-2.5">★★★★★</div>
                <p className="text-sm text-text-primary leading-[1.65] mb-4 italic">{test.q}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0" style={{ background: test.bg }}>
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
          <h2 className="text-[32px] font-extrabold tracking-tight leading-[1.2] mb-2.5">Post your first project in 5 minutes</h2>
          <p className="text-[15px] text-text-secondary mb-7">Free to post. No subscription. Pay only when you hire.</p>
          <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>
            Post a project →
          </Button>
        </div>
      </div>
    </div>
  );
}
