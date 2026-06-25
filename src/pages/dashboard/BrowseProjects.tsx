import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, MapPin, Clock, DollarSign, Filter, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function BrowseProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Join with users table to get the client's full_name
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:client_profiles (
            full_name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.abs(now.getTime() - past.getTime()) / 36e5;

    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search for skills, project titles, or keywords..." 
            className="w-full pl-12 pr-4 py-3 bg-surface border-none rounded-lg outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
          <Filter size={18} /> Filters
        </Button>
      </div>

      <h1 className="text-[28px] font-tenor font-bold mb-6">Explore Open Projects</h1>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-2">No projects found</h3>
          <p className="text-text-secondary">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/freelancer/project/${project.id}`)}
              className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-accent/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                      {project.category}
                    </span>
                    <span className="text-sm text-text-muted flex items-center gap-1">
                      <Clock size={14} /> {getTimeAgo(project.created_at)}
                    </span>
                  </div>
                  <h2 className="text-[20px] font-bold text-text-primary group-hover:text-accent transition-colors leading-tight mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0 md:pl-6 border-l-0 md:border-l border-border min-w-[160px]">
                  <div className="flex items-center gap-1.5 text-text-primary font-bold text-[18px]">
                    <DollarSign size={18} className="text-green-600" />
                    {project.budget} <span className="text-sm font-normal text-text-muted">({project.budget_type})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <MapPin size={16} /> Client: {project.client?.full_name || 'Anonymous'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border/50 gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.skills && project.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="text-[13px] bg-surface text-text-secondary px-3 py-1 rounded-full border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <span className="text-accent font-medium text-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  View Details <ArrowRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
