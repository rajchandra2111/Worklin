import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MapPin, Star, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';

export function ClientProfile() {
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
      const { data: clientData } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('username', profileUsername)
        .maybeSingle();

      if (clientData) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', clientData.id)
          .order('created_at', { ascending: false });
          
        if (reviewsData && reviewsData.length > 0) {
          const freelancerIds = [...new Set(reviewsData.map(r => r.freelancer_id))];
          const { data: freelancersData } = await supabase
            .from('freelancer_profiles')
            .select('id, full_name, avatar_url')
            .in('id', freelancerIds);
            
          reviewsData.forEach(r => {
            r.freelancer = freelancersData?.find(f => f.id === r.freelancer_id);
          });
        }
          
        setProfile({ ...clientData, reviews_list: reviewsData || [] });
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

  const c = profile;
  const tabs = ['Overview', 'Projects', 'Reviews'];

  return (
    <div className="bg-surface min-h-screen pb-20 pt-[88px]">
      <div className="bg-white border-b border-border">
        <div className="max-w-[1000px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 rounded-xl bg-accent text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm overflow-hidden">
              {(c.avatar_url || c.company_logo) ? <img src={(c.avatar_url || c.company_logo).startsWith('http') ? (c.avatar_url || c.company_logo) : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${c.avatar_url || c.company_logo}`} alt={c.company_name || c.full_name} className="w-full h-full object-cover"/> : (c.company_name?.[0] || c.first_name[0])}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                <h1 className="text-3xl font-tenor font-bold">{c.company_name || c.full_name}</h1>
                <VerifiedBadge verified={c.identity_verified} size={24} />
              </div>
              <div className="flex items-center gap-2 text-[15px] mb-2 justify-center md:justify-start">
                <span className="text-text-muted">@{c.username}</span>
              </div>
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
              <div className="space-y-6">
                {c.reviews_list && c.reviews_list.length > 0 ? c.reviews_list.map((review: any) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent text-white flex shrink-0 items-center justify-center font-bold overflow-hidden">
                          {review.freelancer?.avatar_url ? <img src={review.freelancer.avatar_url.startsWith('http') ? review.freelancer.avatar_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${review.freelancer.avatar_url}`} alt={review.freelancer?.full_name} className="w-full h-full object-cover"/> : (review.freelancer?.full_name?.[0] || 'F')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{review.freelancer?.full_name || 'Freelancer'}</h4>
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
