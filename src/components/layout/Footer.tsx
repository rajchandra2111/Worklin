import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-white/70 pt-20 pb-8 px-6 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-tenor font-semibold tracking-widest text-white text-2xl">Worklin_</span>
            </Link>
            <p className="text-sm text-white/50 mb-8 max-w-sm leading-relaxed">
              The premier marketplace for top-tier freelancers and forward-thinking businesses. Secure escrow, global talent, zero friction.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-sm font-bold">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-sm font-bold">
                IN
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-sm font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-sm font-bold">
                GH
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">For Clients</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/client/projects/new" className="hover:text-white transition-colors">Post a Project</Link></li>
              <li><Link to="/browse-freelancers" className="hover:text-white transition-colors">Talent Marketplace</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Enterprise Solutions</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">How to Hire</Link></li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">For Freelancers</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/browse-projects" className="hover:text-white transition-colors">Find Work</Link></li>
              <li><Link to="/freelancer/onboarding" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Worklin_ Pro</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Resources & Company */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/affiliates" className="hover:text-accent text-accent transition-colors">Affiliates & Partners</Link></li>
              <li><Link to="/trust" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Worklin_ Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
