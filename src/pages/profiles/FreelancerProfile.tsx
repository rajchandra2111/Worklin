import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MapPin, Clock, Languages, CheckCircle2, Star, Briefcase, Calendar, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';

export function FreelancerProfile() {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (username) fetchProfile(username);
  }, [username]);

  const fetchProfile = async (profileUsername: string) => {
    try {
      setLoading(true);
      const { data: freelancerData } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('username', profileUsername)
        .maybeSingle();

      if (freelancerData) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', freelancerData.id)
          .order('created_at', { ascending: false });
          
        if (reviewsData && reviewsData.length > 0) {
          const clientIds = [...new Set(reviewsData.map(r => r.client_id))];
          const { data: clientsData } = await supabase
            .from('client_profiles')
            .select('id, full_name, company_name, avatar_url, company_logo')
            .in('id', clientIds);
            
          reviewsData.forEach(r => {
            r.client = clientsData?.find(c => c.id === r.client_id);
          });
        }
          
        setProfile({ ...freelancerData, reviews_list: reviewsData || [] });
      } else {
        setProfile(null);
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
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-tenor font-bold">{p.full_name}</h1>
                    <VerifiedBadge verified={p.identity_verified} size={24} />
                  </div>
                  <div className="flex items-center gap-2 text-[15px] mb-2">
                    <span className="text-text-muted">@{p.username}</span>
                  </div>
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
                  <div key={i} className="border border-border rounded-xl bg-white overflow-hidden group hover:border-accent hover:shadow-sm transition-all flex flex-col">
                    {port.image_url ? (
                      <div className="h-40 w-full overflow-hidden border-b border-border bg-surface">
                        <img src={port.image_url.startsWith('http') ? port.image_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolios/${port.image_url}`} alt={port.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-40 bg-surface border-b border-border flex items-center justify-center shrink-0">
                        <FolderOpen size={40} className="text-text-muted group-hover:text-accent transition-colors" strokeWidth={1} />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold mb-1.5 text-[15px]">{port.name}</h3>
                      <p className="text-[13px] text-text-secondary mb-4 line-clamp-2 flex-1">{port.description}</p>
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
              <div className="space-y-6">
                {p.reviews_list && p.reviews_list.length > 0 ? p.reviews_list.map((review: any) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex shrink-0 items-center justify-center font-bold overflow-hidden">
                         {(review.client?.company_logo || review.client?.avatar_url) ? <img src={(review.client.company_logo || review.client.avatar_url).startsWith('http') ? (review.client.company_logo || review.client.avatar_url) : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${review.client.company_logo || review.client.avatar_url}`} alt={review.client?.full_name} className="w-full h-full object-cover"/> : (review.client?.company_name?.[0] || review.client?.full_name?.[0] || 'C')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{review.client?.company_name || review.client?.full_name || 'Client'}</h4>
                        <div className="flex items-center gap-2 mt-1 mb-2 text-sm text-text-secondary">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className={s <= review.rating ? "text-warning fill-warning" : "text-border"} />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed">{review.feedback}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-text-muted text-sm">No reviews yet.</p>
                )}
              </div>
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
