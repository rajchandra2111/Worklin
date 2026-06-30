import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Star, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';

export function HireFreelancers() {
  const navigate = useNavigate();
  const { openAuthModal } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('q') || '';
  const minRate = searchParams.get('minRate') || '';
  const maxRate = searchParams.get('maxRate') || '';
  const skillsFilter = searchParams.get('skills') || '';
  const minRating = searchParams.get('minRating') || '';
  
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (localSearch) newParams.set('q', localSearch);
      else newParams.delete('q');
      setSearchParams(newParams);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  useEffect(() => {
    fetchFreelancers();
  }, [searchQuery, minRate, maxRate, skillsFilter, minRating]);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('freelancer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,professional_title.ilike.%${searchQuery}%`);
      }

      if (minRate) query = query.gte('hourly_rate', parseInt(minRate));
      if (maxRate) query = query.lte('hourly_rate', parseInt(maxRate));
      
      if (skillsFilter) {
        const skillsArray = skillsFilter.split(',').map(s => s.trim()).filter(Boolean);
        if (skillsArray.length > 0) {
          query = query.contains('skills', skillsArray);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by minRating post-query since it's inside JSONB and we might need complex cast
      let filteredData = data || [];
      if (minRating) {
        filteredData = filteredData.filter(f => (f.metrics?.rating || 0) >= parseFloat(minRating));
      }

      setFreelancers(filteredData);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
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

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="lg:w-[280px] shrink-0">
          <div className="sticky top-6 space-y-8">
            
            {/* Hourly Rate */}
            <div>
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                Hourly Rate ($)
              </h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minRate}
                  onChange={(e) => updateFilter('minRate', e.target.value)}
                  className="w-full p-2 border border-border rounded text-sm outline-none focus:border-accent"
                />
                <span className="text-text-muted">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxRate}
                  onChange={(e) => updateFilter('maxRate', e.target.value)}
                  className="w-full p-2 border border-border rounded text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="pt-8 border-t border-border">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                Required Skills
              </h3>
              <div className="mb-2">
                <input 
                  type="text" 
                  placeholder="e.g. React, Node.js" 
                  value={skillsFilter}
                  onChange={(e) => updateFilter('skills', e.target.value)}
                  className="w-full p-2 border border-border rounded text-sm outline-none focus:border-accent"
                />
                <p className="text-xs text-text-muted mt-1">Separate multiple skills with commas</p>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-8 border-t border-border">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                Minimum Rating
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="minRating" 
                    checked={!minRating}
                    onChange={() => updateFilter('minRating', '')}
                    className="w-4 h-4 text-accent border-border focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Any Rating</span>
                </label>
                {[4.5, 4.0, 3.0].map(rating => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="minRating"
                      checked={minRating === rating.toString()}
                      onChange={() => updateFilter('minRating', rating.toString())}
                      className="w-4 h-4 text-accent border-border focus:ring-accent"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
                      {rating} & up <Star size={12} className="text-warning fill-warning" />
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Search Header */}
          <div className="bg-white p-2 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-2 relative z-10">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-4 text-text-muted" size={20} />
              <input 
                type="text" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search for skills, names, or keywords..." 
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-[15px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-tenor font-bold text-text-primary">
              {loading ? 'Searching...' : `${freelancers.length} Freelancers Found`}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-xl border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-text-muted" size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">No freelancers found</h3>
              <p className="text-text-secondary">Try adjusting your filters or search keywords.</p>
              <Button variant="outline" className="mt-6" onClick={() => {
                setLocalSearch('');
                setSearchParams(new URLSearchParams());
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {freelancers.map((freelancer) => (
                <div 
                  key={freelancer.id}
                  onClick={() => navigate(`/freelancer/profile/${freelancer.username || freelancer.id}`)}
                  className="bg-white border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-accent hover:shadow-card group relative"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-accent-dim text-accent flex shrink-0 items-center justify-center font-bold text-xl overflow-hidden">
                        {freelancer.avatar_url ? (
                          <img src={freelancer.avatar_url.startsWith('http') ? freelancer.avatar_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${freelancer.avatar_url}`} alt={freelancer.full_name} className="w-full h-full object-cover"/>
                        ) : (freelancer.full_name?.charAt(0) || 'F')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors">{freelancer.full_name}</h3>
                          <VerifiedBadge verified={freelancer.identity_verified} size={16} />
                        </div>
                        <div className="text-[14px] text-text-muted mt-0.5">{freelancer.professional_title || 'Freelance Expert'}</div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-[13px] text-text-secondary">
                            <Star size={14} className="text-warning fill-warning" />
                            <span className="font-semibold text-text-primary">{freelancer.metrics?.rating || '0.0'}</span>
                            <span>({freelancer.metrics?.completed_projects || 0} jobs)</span>
                          </div>
                          {freelancer.country && (
                            <div className="flex items-center gap-1 text-[13px] text-text-secondary">
                              <MapPin size={14} /> {freelancer.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                      {freelancer.hourly_rate && (
                        <div className="text-[18px] font-bold text-text-primary">
                          ${freelancer.hourly_rate}<span className="text-sm font-normal text-text-muted">/hr</span>
                        </div>
                      )}
                      <Button variant="outline" className="mt-3 md:mt-2 w-full md:w-auto" onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/profile/${freelancer.username || freelancer.id}`); }}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                  
                  {freelancer.about_me && (
                    <p className="text-sm text-text-secondary line-clamp-2 mt-4 leading-relaxed">
                      {freelancer.about_me}
                    </p>
                  )}

                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {freelancer.skills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="text-[12px] bg-surface text-text-secondary px-2.5 py-1 rounded-md border border-border">
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 5 && (
                        <span className="text-[12px] text-text-muted px-1 py-1">+{freelancer.skills.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
