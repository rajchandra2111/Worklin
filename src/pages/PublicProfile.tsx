import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Clock, Languages, CheckCircle2, Star, Briefcase, Calendar, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [type, setType] = useState<'freelancer' | 'client' | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) fetchProfile(id);
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    try {
      setLoading(true);
      // Try freelancer first
      const { data: freelancerData, error: fError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (freelancerData) {
        setProfile(freelancerData);
        setType('freelancer');
        return;
      }

      // Try client
      const { data: clientData, error: cError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (clientData) {
        setProfile(clientData);
        setType('client');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <Link to="/" className="text-accent hover:underline flex items-center gap-2"><ArrowLeft size={16}/> Back Home</Link>
      </div>
    );
  }

  // FREELANCER VIEW
  if (type === 'freelancer') {
    const tabs = ['Overview', 'Portfolio', 'Experience', 'Reviews'];
    const p = profile;

    return (
      <div className="bg-surface min-h-screen pb-20 pt-[88px]">
        {/* Header Section */}
        <div className="bg-white border-b border-border">
          <div className="max-w-[1000px] mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold shrink-0 overflow-hidden">
                {p.avatar_url ? <img src={p.avatar_url.startsWith('http') ? p.avatar_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_url}`} alt={p.full_name} className="w-full h-full object-cover"/> : p.first_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-tenor font-bold mb-1">{p.full_name}</h1>
                    <p className="text-[17px] text-text-secondary">{p.professional_title || 'Freelance Professional'}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">Save Profile</Button>
                    <Button variant="primary">Hire Me</Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary mb-5">
                  {p.country && <div className="flex items-center gap-1.5"><MapPin size={16} className="text-text-muted"/> {p.country}</div>}
                  {p.timezone && <div className="flex items-center gap-1.5"><Clock size={16} className="text-text-muted"/> {p.timezone}</div>}
                  {p.hourly_rate && <div className="flex items-center gap-1.5"><div className="font-semibold text-text-primary">${p.hourly_rate}</div> / hr</div>}
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500"/> {p.availability || 'Available'}</div>
                </div>

                {p.languages && p.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Languages size={16} className="text-text-muted" />
                    {p.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-white sticky top-[88px] z-10">
          <div className="max-w-[1000px] mx-auto px-6 flex gap-8">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-4 text-[15px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent outline-none ${activeTab === tab.toLowerCase() ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            {activeTab === 'overview' && (
              <>
                <section>
                  <h2 className="text-xl font-bold font-tenor mb-4">About Me</h2>
                  <div className="text-[15px] text-text-secondary leading-[1.7] whitespace-pre-wrap">
                    {p.about_me || "This freelancer hasn't added a description yet."}
                  </div>
                </section>
                
                <hr className="border-border" />
                
                <section>
                  <h2 className="text-xl font-bold font-tenor mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {p.skills && p.skills.length > 0 ? p.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 rounded-full border border-border bg-white text-[13px] text-text-secondary">
                        {skill}
                      </span>
                    )) : (
                      <p className="text-text-muted text-sm">No skills listed.</p>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'experience' && (
              <section>
                <h2 className="text-xl font-bold font-tenor mb-6">Work Experience</h2>
                <div className="space-y-6">
                  {p.experience && p.experience.length > 0 ? p.experience.map((exp: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                        <Briefcase size={20} className="text-text-muted" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{exp.role}</h3>
                        <div className="text-[15px] text-text-secondary mb-1">{exp.company}</div>
                        <div className="text-xs text-text-muted mb-3 flex items-center gap-1.5"><Calendar size={14}/> {exp.duration}</div>
                        <p className="text-sm text-text-secondary leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-text-muted text-sm">No experience listed.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'portfolio' && (
              <section>
                <h2 className="text-xl font-bold font-tenor mb-6">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {p.portfolio && p.portfolio.length > 0 ? p.portfolio.map((port: any, i: number) => (
                    <div key={i} className="border border-border rounded-xl bg-white overflow-hidden group hover:border-accent hover:shadow-sm transition-all">
                      <div className="h-40 bg-surface border-b border-border flex items-center justify-center">
                        <FolderOpen size={40} className="text-text-muted group-hover:text-accent transition-colors" strokeWidth={1} />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold mb-1.5 text-[15px]">{port.name}</h3>
                        <p className="text-[13px] text-text-secondary mb-4 line-clamp-2">{port.description}</p>
                        {port.tech && <div className="text-xs text-text-muted font-medium mb-4">{port.tech}</div>}
                        <div className="flex gap-3">
                          {port.url && <a href={port.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-accent hover:underline">Live Demo</a>}
                          {port.github && <a href={port.github} target="_blank" rel="noreferrer" className="text-xs font-semibold text-text-secondary hover:underline">GitHub</a>}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-text-muted text-sm">No portfolio items listed.</p>
                  )}
                </div>
              </section>
            )}
            
            {activeTab === 'reviews' && (
              <section>
                <h2 className="text-xl font-bold font-tenor mb-6">Client Reviews</h2>
                <p className="text-text-muted text-sm">No reviews yet.</p>
              </section>
            )}

          </div>
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h3 className="font-semibold mb-4">Freelancer Metrics</h3>
              <div className="space-y-4 text-[13px]">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-text-secondary">Jobs Completed</span>
                  <span className="font-semibold">{p.metrics?.projects_completed || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-text-secondary">Success Rate</span>
                  <span className="font-semibold">{p.metrics?.success_rate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Rating</span>
                  <span className="font-semibold flex items-center gap-1"><Star size={14} className="text-warning fill-warning"/> {p.metrics?.avg_rating || 'New'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLIENT VIEW
  const c = profile;
  const tabs = ['Overview', 'Projects', 'Reviews'];

  return (
    <div className="bg-surface min-h-screen pb-20 pt-[88px]">
      <div className="bg-white border-b border-border">
        <div className="max-w-[1000px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 rounded-xl bg-accent text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm overflow-hidden">
              {c.company_logo ? <img src={c.company_logo.startsWith('http') ? c.company_logo : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${c.company_logo}`} alt={c.company_name || c.full_name} className="w-full h-full object-cover"/> : (c.company_name?.[0] || c.first_name[0])}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-tenor font-bold mb-1">{c.company_name || c.full_name}</h1>
              <p className="text-[17px] text-text-secondary mb-4">{c.industry || 'Client'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-text-secondary">
                {c.country && <div className="flex items-center gap-1.5"><MapPin size={16} className="text-text-muted"/> {c.country}</div>}
                {c.company_size && <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-text-muted"/> {c.company_size} Employees</div>}
                {c.website && <div className="flex items-center gap-1.5 text-accent"><a href={c.website} target="_blank" rel="noreferrer" className="hover:underline">{new URL(c.website).hostname}</a></div>}
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
              <Button variant="primary">Message Client</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-white sticky top-[88px] z-10">
        <div className="max-w-[1000px] mx-auto px-6 flex gap-8">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-4 text-[15px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent outline-none ${activeTab === tab.toLowerCase() ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {activeTab === 'overview' && (
            <>
              <section>
                <h2 className="text-xl font-bold font-tenor mb-4">About Company</h2>
                <div className="text-[15px] text-text-secondary leading-[1.7] whitespace-pre-wrap">
                  {c.about_company || "This client hasn't added a description yet."}
                </div>
              </section>
              
              <hr className="border-border" />
              
              <section>
                <h2 className="text-xl font-bold font-tenor mb-4">Hiring Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {c.hiring_interests && c.hiring_interests.length > 0 ? c.hiring_interests.map((interest: string) => (
                    <span key={interest} className="px-3 py-1.5 rounded-full border border-border bg-white text-[13px] text-text-secondary">
                      {interest}
                    </span>
                  )) : (
                    <p className="text-text-muted text-sm">No hiring interests listed.</p>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'projects' && (
            <section>
              <h2 className="text-xl font-bold font-tenor mb-6">Past Projects</h2>
              <p className="text-text-muted text-sm">No projects to show yet.</p>
            </section>
          )}
          
          {activeTab === 'reviews' && (
            <section>
              <h2 className="text-xl font-bold font-tenor mb-6">Freelancer Reviews</h2>
              <p className="text-text-muted text-sm">No reviews yet.</p>
            </section>
          )}

        </div>
        
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold mb-4">Client Metrics</h3>
            <div className="space-y-4 text-[13px]">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-text-secondary">Projects Posted</span>
                <span className="font-semibold">{c.hiring_metrics?.projects_posted || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-text-secondary">Hire Rate</span>
                <span className="font-semibold">{c.hiring_metrics?.hire_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-text-secondary">Total Spent</span>
                <span className="font-semibold">${c.hiring_metrics?.total_spent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Rating</span>
                <span className="font-semibold flex items-center gap-1"><Star size={14} className="text-warning fill-warning"/> {c.hiring_metrics?.avg_freelancer_rating || 'New'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
