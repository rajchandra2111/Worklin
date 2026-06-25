import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';

export function HireFreelancers() {
  const { openAuthModal } = useUiStore();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreelancers(data || []);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto px-6">
      
      {/* Hero Section */}
      <div className="py-16 text-center max-w-[800px] mx-auto border-b border-border mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">For Clients</p>
        <h1 className="text-4xl md:text-5xl font-tenor font-normal uppercase tracking-[0.08em] leading-tight mb-5">
          Find the perfect freelance services for your business
        </h1>
        <p className="text-base text-text-secondary mb-8 max-w-[600px] mx-auto">
          Get your projects done by vetted experts on a secure, escrow-backed platform.
        </p>
        <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>
          Post a project — it's free
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-tenor font-bold">Browse Expert Freelancers</h2>
      </div>

      {/* Search Header */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search for skills, names, or keywords..." 
            className="w-full pl-12 pr-4 py-3 bg-surface border-none rounded-lg outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
          <Filter size={18} /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-2">No freelancers found</h3>
          <p className="text-text-secondary">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {freelancers.map((freelancer) => (
            <div 
              key={freelancer.id}
              onClick={() => openAuthModal('signup', 'client')}
              className="bg-white border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-accent hover:shadow-card hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent-dim text-accent flex items-center justify-center font-bold text-xl">
                    {freelancer.full_name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary">{freelancer.full_name}</h3>
                    <div className="text-[13px] text-text-muted mt-0.5">{freelancer.title || 'Freelance Expert'}</div>
                  </div>
                </div>
                {freelancer.hourly_rate && (
                  <div className="bg-surface px-3 py-1.5 rounded-lg text-sm font-semibold text-text-primary">
                    €{freelancer.hourly_rate}/hr
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-[13px] text-text-secondary">
                  <Star size={16} className="text-warning fill-warning" />
                  <span className="font-semibold text-text-primary">5.0</span>
                  <span>(0 jobs)</span>
                </div>
                <div className="flex items-center gap-1 text-[13px] text-text-secondary">
                  <MapPin size={16} /> Global
                </div>
              </div>

              {freelancer.bio && (
                <p className="text-sm text-text-secondary line-clamp-3 mb-5 leading-relaxed">
                  {freelancer.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {freelancer.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="text-[12px] bg-surface text-text-secondary px-2.5 py-1 rounded-md border border-border">
                    {skill}
                  </span>
                ))}
              </div>
              
              <Button variant="outline" className="w-full justify-center">
                View Profile
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
