import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { PortfolioImageUpload } from '../../components/ui/PortfolioImageUpload';
import { Plus, Trash2 } from 'lucide-react';

export function FreelancerSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [profile, setProfile] = useState<any>({
    first_name: '',
    last_name: '',
    username: '',
    professional_title: '',
    country: '',
    timezone: '',
    avatar_url: '',
    languages: [],
    availability: 'Available',
    hourly_rate: '',
    about_me: '',
    skills: [],
    service_specialization: [],
    experience: [],
    education: [],
    portfolio: [],
    work_preferences: { size: [], engagement: [] }
  });

  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setProfile({
          ...data,
          skills: data.skills || [],
          languages: data.languages || [],
          service_specialization: data.service_specialization || [],
          experience: data.experience || [],
          education: data.education || [],
          portfolio: data.portfolio || [],
          work_preferences: data.work_preferences || { size: [], engagement: [] },
          identity_verified: data.identity_verified || false
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleArrayAdd = (e: React.KeyboardEvent, field: string, input: string, setInput: any) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!profile[field].includes(input.trim())) {
        setProfile({
          ...profile,
          [field]: [...profile[field], input.trim()]
        });
      }
      setInput('');
    }
  };

  const removeArrayItem = (field: string, item: string) => {
    setProfile({
      ...profile,
      [field]: profile[field].filter((i: string) => i !== item)
    });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [...profile.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExp = [...profile.experience];
    newExp[index][field] = value;
    setProfile({ ...profile, experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = [...profile.experience];
    newExp.splice(index, 1);
    setProfile({ ...profile, experience: newExp });
  };

  const addPortfolio = () => {
    setProfile({
      ...profile,
      portfolio: [...profile.portfolio, { name: '', description: '', tech: '', url: '', github: '' }]
    });
  };

  const updatePortfolio = (index: number, field: string, value: string) => {
    const newPort = [...profile.portfolio];
    newPort[index][field] = value;
    setProfile({ ...profile, portfolio: newPort });
  };

  const removePortfolio = (index: number) => {
    const newPort = [...profile.portfolio];
    newPort.splice(index, 1);
    setProfile({ ...profile, portfolio: newPort });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('freelancer_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          username: profile.username,
          professional_title: profile.professional_title,
          country: profile.country,
          timezone: profile.timezone,
          avatar_url: profile.avatar_url,
          languages: profile.languages,
          availability: profile.availability,
          hourly_rate: parseFloat(profile.hourly_rate) || null,
          about_me: profile.about_me,
          skills: profile.skills,
          service_specialization: profile.service_specialization,
          experience: profile.experience,
          education: profile.education,
          portfolio: profile.portfolio,
          work_preferences: profile.work_preferences
        })
        .eq('id', user?.id);
        
      if (error) {
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
          throw new Error('This username is already taken. Please choose another one.');
        }
        throw error;
      }
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleVerifyIdentity = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-identity-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ role: 'freelancer' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create verification session');
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error starting verification:', err);
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-[28px] font-tenor font-bold mb-6">Freelancer Settings</h1>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Basic Information</h2>
          
          <div className="mb-6 flex items-center gap-6">
            <AvatarUpload 
              url={profile.avatar_url} 
              onUpload={(url) => setProfile({...profile, avatar_url: url})} 
              size={100}
            />
            <div className="text-sm text-text-secondary">
              Upload a professional profile photo. Faces are more trusted!
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First Name</label>
              <input type="text" name="first_name" required value={profile.first_name} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last Name</label>
              <input type="text" name="last_name" required value={profile.last_name} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Username (Public Profile URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm bg-surface border border-border rounded-l-md px-3 py-[11px]">worklin.com/freelancer/profile/</span>
                <input type="text" name="username" required value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')})} className="flex-1 p-[11px] px-3.5 border-[1.5px] border-border rounded-r-md font-inherit text-sm outline-none focus:border-accent" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Professional Title</label>
              <input type="text" name="professional_title" placeholder="e.g. Senior Full Stack Developer" value={profile.professional_title || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Country</label>
              <input type="text" name="country" required value={profile.country} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Timezone</label>
              <input type="text" name="timezone" placeholder="e.g. UTC+2" value={profile.timezone || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Hourly Rate ($)</label>
              <input type="number" name="hourly_rate" value={profile.hourly_rate || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Availability</label>
              <select name="availability" value={profile.availability} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent bg-white">
                <option value="Available">Available</option>
                <option value="Partially Available">Partially Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">About Me</h2>
          <div className="mb-5">
            <textarea name="about_me" placeholder="Tell clients who you are, what you specialize in, and why they should hire you..." value={profile.about_me || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent h-40 resize-none" />
            <p className="text-xs text-text-muted mt-2">Avoid simple greetings. Write a detailed professional description.</p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Skills & Languages</h2>
          
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Skills (Max 20)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((skill: string) => (
                <div key={skill} className="inline-flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-full text-sm">
                  {skill}
                  <button type="button" onClick={() => removeArrayItem('skills', skill)} className="text-text-muted hover:text-red-500 bg-transparent border-none cursor-pointer">×</button>
                </div>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="e.g. React, Node.js (Press Enter to add)" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => handleArrayAdd(e, 'skills', skillInput, setSkillInput)}
              className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
              disabled={profile.skills.length >= 20}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Languages</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.languages.map((lang: string) => (
                <div key={lang} className="inline-flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-full text-sm">
                  {lang}
                  <button type="button" onClick={() => removeArrayItem('languages', lang)} className="text-text-muted hover:text-red-500 bg-transparent border-none cursor-pointer">×</button>
                </div>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="e.g. English (Fluent), Spanish (Basic)" 
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => handleArrayAdd(e, 'languages', languageInput, setLanguageInput)}
              className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
            <h2 className="text-lg font-semibold">Experience</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addExperience} className="flex items-center gap-1">
              <Plus size={16} /> Add Experience
            </Button>
          </div>
          
          {profile.experience.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No experience added yet.</p>
          ) : (
            <div className="space-y-6">
              {profile.experience.map((exp: any, index: number) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-surface/50 relative group">
                  <button type="button" onClick={() => removeExperience(index)} className="absolute top-4 right-4 text-text-muted hover:text-red-500 bg-transparent border-none cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
                      <input type="text" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
                      <input type="text" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-text-secondary mb-1">Duration (e.g. 2020 - 2024)</label>
                      <input type="text" value={exp.duration} onChange={e => updateExperience(index, 'duration', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                    <textarea value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent h-20 resize-none" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
            <h2 className="text-lg font-semibold">Portfolio Projects</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addPortfolio} className="flex items-center gap-1">
              <Plus size={16} /> Add Project
            </Button>
          </div>
          
          {profile.portfolio.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No portfolio projects added yet. Extremely important for getting hired!</p>
          ) : (
            <div className="space-y-6">
              {profile.portfolio.map((port: any, index: number) => (
                <div key={index} className="border border-border rounded-lg bg-surface/50 relative group flex flex-col overflow-hidden">
                  <PortfolioImageUpload 
                    url={port.image_url} 
                    onUpload={(url) => updatePortfolio(index, 'image_url', url)} 
                    onRemove={() => updatePortfolio(index, 'image_url', '')} 
                  />
                  <button type="button" onClick={() => removePortfolio(index)} className="absolute top-4 right-4 text-white hover:text-red-300 bg-black/40 hover:bg-black/60 p-1.5 rounded-md border-none cursor-pointer z-10 transition-colors shadow-sm">
                    <Trash2 size={18} />
                  </button>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-text-secondary mb-1">Project Name</label>
                      <input type="text" value={port.name} onChange={e => updatePortfolio(index, 'name', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Live Demo URL</label>
                      <input type="url" value={port.url} onChange={e => updatePortfolio(index, 'url', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">GitHub URL</label>
                      <input type="url" value={port.github} onChange={e => updatePortfolio(index, 'github', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-text-secondary mb-1">Technologies Used</label>
                      <input type="text" value={port.tech} placeholder="React, Node, Postgres" onChange={e => updatePortfolio(index, 'tech', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                    <textarea value={port.description} onChange={e => updatePortfolio(index, 'description', e.target.value)} className="w-full p-[9px] border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent h-20 resize-none" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust & Verification */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Trust & Verification</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-surface/50">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Identity Verification</h3>
              <p className="text-sm text-text-secondary">Verify your identity with a government ID to earn the Verified Badge and build trust with clients.</p>
            </div>
            <div className="shrink-0">
              {profile.identity_verified ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={handleVerifyIdentity} disabled={saving}>
                  Verify Identity
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
