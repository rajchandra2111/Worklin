import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Clock, DollarSign, Heart, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Data Science',
];

export function BrowseProjects() {
  const navigate = useNavigate();
  const { openAuthModal } = useUiStore();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search State from URL
  const searchQuery = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || '';
  const activeBudgetType = searchParams.get('budgetType') || '';
  const activeSort = searchParams.get('sort') || 'newest';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());
  
  // Local state for the debounced search input
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Handle Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (localSearch) {
        newParams.set('q', localSearch);
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchSavedProjects();
    }
  }, [searchQuery, activeCategory, activeBudgetType, activeSort, user]);

  const fetchSavedProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('project_id')
        .eq('freelancer_id', user.id);
      
      if (error) throw error;
      
      setSavedProjectIds(new Set(data.map(d => d.project_id)));
    } catch (err) {
      console.error('Error fetching saved projects:', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          client:client_profiles (
            full_name
          )
        `)
        .eq('status', 'open');

      // Apply Sort
      if (activeSort === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false }); // newest is default
      }

      // Apply Filters
      if (searchQuery) {
        // Search in title or description
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      if (activeCategory) {
        query = query.eq('category', activeCategory);
      }

      if (activeBudgetType) {
        query = query.eq('budget_type', activeBudgetType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent navigating to project details
    
    if (!user) {
      openAuthModal('signup', 'freelancer');
      return;
    }

    const isSaved = savedProjectIds.has(projectId);
    
    try {
      // Optimistic UI update
      const newSaved = new Set(savedProjectIds);
      if (isSaved) {
        newSaved.delete(projectId);
      } else {
        newSaved.add(projectId);
      }
      setSavedProjectIds(newSaved);

      if (isSaved) {
        await supabase
          .from('saved_projects')
          .delete()
          .eq('project_id', projectId)
          .eq('freelancer_id', user.id);
      } else {
        await supabase
          .from('saved_projects')
          .insert({ project_id: projectId, freelancer_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      // Revert on error
      fetchSavedProjects();
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.abs(now.getTime() - past.getTime()) / 36e5;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Hero Section (Only show if not logged in) */}
      {!user && (
        <div className="py-16 text-center max-w-[800px] mx-auto border-b border-border mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">For Freelancers</p>
          <h1 className="text-4xl md:text-5xl font-tenor font-normal uppercase tracking-[0.08em] leading-tight mb-5">
            Find rewarding projects and grow your career
          </h1>
          <p className="text-base text-text-secondary mb-8 max-w-[600px] mx-auto">
            Join thousands of businesses hiring on <span className="font-tenor font-semibold tracking-tight text-primary">Worklin_</span>. Low fees, guaranteed payments, and a global talent pool.
          </p>
          <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'freelancer')}>
            Join as a freelancer
          </Button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="lg:w-[280px] shrink-0">
          <div className="sticky top-6 space-y-8">
            <div>
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                Category
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={!activeCategory}
                    onChange={() => updateFilter('category', '')}
                    className="w-4 h-4 text-accent border-border focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">All Categories</span>
                </label>
                {CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={activeCategory === category}
                      onChange={() => updateFilter('category', category)}
                      className="w-4 h-4 text-accent border-border focus:ring-accent"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                Budget Type
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="budgetType" 
                    checked={!activeBudgetType}
                    onChange={() => updateFilter('budgetType', '')}
                    className="w-4 h-4 text-accent border-border focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Any</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="budgetType" 
                    checked={activeBudgetType === 'hourly'}
                    onChange={() => updateFilter('budgetType', 'hourly')}
                    className="w-4 h-4 text-accent border-border focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Hourly Rate</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="budgetType" 
                    checked={activeBudgetType === 'fixed'}
                    onChange={() => updateFilter('budgetType', 'fixed')}
                    className="w-4 h-4 text-accent border-border focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Fixed Price</span>
                </label>
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
                placeholder="Search for skills, project titles, or keywords..." 
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-[15px]"
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-tenor font-bold text-text-primary">
              {loading ? 'Searching...' : `${projects.length} Jobs Found`}
            </h2>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              Sort by: 
              <div className="relative">
                <select 
                  value={activeSort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none bg-transparent font-semibold text-text-primary cursor-pointer outline-none pr-6 focus:ring-0"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
              </div>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-3 w-3/4">
                      <div className="h-4 bg-surface rounded w-1/4"></div>
                      <div className="h-6 bg-surface rounded w-3/4"></div>
                      <div className="h-4 bg-surface rounded w-full"></div>
                    </div>
                    <div className="h-8 w-8 bg-surface rounded-full"></div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <div className="h-6 w-20 bg-surface rounded-full"></div>
                    <div className="h-6 w-20 bg-surface rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-xl border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-text-muted" size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">No projects found</h3>
              <p className="text-text-secondary">Try adjusting your filters or search keywords.</p>
              <Button variant="outline" className="mt-6" onClick={() => {
                setLocalSearch('');
                setSearchParams(new URLSearchParams());
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(user ? `/freelancer/project/${project.id}` : '/login')}
                  className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-accent hover:shadow-md transition-all cursor-pointer group relative"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                          {project.category}
                        </span>
                        <span className="text-sm text-text-muted flex items-center gap-1">
                          <Clock size={14} /> {getTimeAgo(project.created_at)}
                        </span>
                      </div>
                      
                      <h2 className="text-[20px] font-bold text-text-primary group-hover:text-accent transition-colors leading-tight mb-3 pr-8">
                        {project.title}
                      </h2>
                      
                      <p className="text-[15px] text-text-secondary line-clamp-2 leading-relaxed mb-4">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {project.skills && project.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="text-[12px] bg-surface text-text-secondary px-3 py-1.5 rounded-full border border-border font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0 md:min-w-[140px]">
                      <button 
                        onClick={(e) => handleToggleSave(e, project.id)}
                        className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                          savedProjectIds.has(project.id) 
                            ? 'text-accent bg-accent/10 hover:bg-accent/20' 
                            : 'text-text-muted hover:text-accent hover:bg-surface'
                        }`}
                      >
                        <Heart size={20} fill={savedProjectIds.has(project.id) ? 'currentColor' : 'none'} />
                      </button>

                      <div className="mt-8 md:mt-10 flex flex-col items-start md:items-end">
                        <div className="text-[18px] font-bold text-text-primary mb-0.5 flex items-center">
                          <DollarSign size={18} className="text-accent" />
                          {project.budget}
                        </div>
                        <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                          {project.budget_type}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary mt-2">
                        <MapPin size={16} className="text-text-muted" /> 
                        {project.client?.full_name || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
