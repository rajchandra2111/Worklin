import { Button } from '../components/ui/Button';
import { Gift, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Affiliates() {
  return (
    <div className="flex flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 bg-surface border-b border-border text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wide uppercase mb-6">
              Partner Program
            </span>
            <h1 className="text-4xl md:text-6xl font-tenor font-bold text-text-primary mb-6 tracking-tight leading-tight">
              Earn by growing the Worklin_ network.
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              We're building a double-sided affiliate program. Refer top-tier clients and elite freelancers, and earn a percentage of platform fees or flat bounties.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-white p-2 pr-6 rounded-full border border-border shadow-sm mb-12">
              <span className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Coming Soon
              </span>
              <span className="text-sm font-medium text-text-primary">
                We're finalizing the mechanics. Check back soon.
              </span>
            </div>
          </div>
        </section>

        {/* Feature Preview */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-tenor font-bold text-text-primary mb-12 text-center">How it will work</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
              <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-3">Refer Users</h3>
              <p className="text-text-secondary text-sm">
                Share your unique referral link with your network of freelancers or businesses looking to hire.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
              <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-3">Track Conversions</h3>
              <p className="text-text-secondary text-sm">
                Monitor your referrals, signups, and active contracts through a dedicated partner dashboard.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
              <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-3">Earn Bounties</h3>
              <p className="text-text-secondary text-sm">
                Get paid out automatically via Stripe directly to your bank account for every successful referral.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-24 px-6 bg-primary text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-tenor font-bold mb-6">Want early access?</h2>
            <p className="text-white/70 mb-10 text-lg">
              Create an account today and we'll notify you the moment the affiliate program goes live.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
