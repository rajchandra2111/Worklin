import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { AvatarUpload } from '../../components/ui/AvatarUpload';

export function ClientSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [profile, setProfile] = useState<any>({
    first_name: '',
    last_name: '',
    username: '',
    company_name: '',
    country: '',
    avatar_url: '',
    company_logo: '',
    industry: '',
    about_company: '',
    website: '',
    linkedin: '',
    company_size: '',
    hiring_interests: []
  });

  const [hiringInterestInput, setHiringInterestInput] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setProfile({
          ...data,
          hiring_interests: data.hiring_interests || [],
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

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hiringInterestInput.trim()) {
      e.preventDefault();
      if (!profile.hiring_interests.includes(hiringInterestInput.trim())) {
        setProfile({
          ...profile,
          hiring_interests: [...profile.hiring_interests, hiringInterestInput.trim()]
        });
      }
      setHiringInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      hiring_interests: profile.hiring_interests.filter((i: string) => i !== interest)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          full_name: `${profile.first_name} ${profile.last_name}`.trim(),
          username: profile.username,
          company_name: profile.company_name,
          country: profile.country,
          avatar_url: profile.avatar_url,
          company_logo: profile.company_logo,
          industry: profile.industry,
          about_company: profile.about_company,
          website: profile.website,
          linkedin: profile.linkedin,
          company_size: profile.company_size,
          hiring_interests: profile.hiring_interests
        })
        .eq('id', user?.id);
        
      if (error) {
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
          throw new Error('This username is already taken. Please choose another one.');
        }
        throw error;
      }
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
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
        body: JSON.stringify({ role: 'client' })
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

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <h1 className="text-[28px] font-tenor font-bold mb-6">Client Settings</h1>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Personal Identity</h2>
          
          <div className="mb-6 flex items-center gap-6">
            <AvatarUpload 
              url={profile.avatar_url} 
              onUpload={(url) => setProfile({...profile, avatar_url: url})} 
              size={100}
            />
            <div className="text-sm text-text-secondary">
              Upload a professional photo to build trust with freelancers.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <span className="text-text-muted text-sm bg-surface border border-border rounded-l-md px-3 py-[11px]">worklin.com/client/profile/</span>
                <input type="text" name="username" required value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')})} className="flex-1 p-[11px] px-3.5 border-[1.5px] border-border rounded-r-md font-inherit text-sm outline-none focus:border-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Company Profile</h2>
          
          <div className="mb-6 flex items-center gap-6">
            <AvatarUpload 
              url={profile.company_logo} 
              onUpload={(url) => setProfile({...profile, company_logo: url})} 
              size={80}
            />
            <div className="text-sm text-text-secondary">
              Upload your company logo.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Company Name</label>
              <input type="text" name="company_name" value={profile.company_name} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Industry</label>
              <input type="text" name="industry" placeholder="e.g. Fintech, E-commerce" value={profile.industry || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Location (Country)</label>
              <input type="text" name="country" value={profile.country} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Company Size</label>
              <select name="company_size" value={profile.company_size || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent bg-white">
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">About Company</label>
            <textarea name="about_company" placeholder="Describe your mission, products, and what you do..." value={profile.about_company || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent h-32 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Website</label>
              <input type="url" name="website" placeholder="https://" value={profile.website || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">LinkedIn Profile</label>
              <input type="url" name="linkedin" placeholder="https://linkedin.com/company/..." value={profile.linkedin || ''} onChange={handleChange} className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        {/* Hiring Interests */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Hiring Interests</h2>
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">What roles do you typically hire for?</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.hiring_interests.map((interest: string) => (
                <div key={interest} className="inline-flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-full text-sm">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} className="text-text-muted hover:text-red-500 bg-transparent border-none cursor-pointer">×</button>
                </div>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="e.g. React Developers, UI Designers (Press Enter to add)" 
              value={hiringInterestInput}
              onChange={(e) => setHiringInterestInput(e.target.value)}
              onKeyDown={handleAddInterest}
              className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Trust & Verification */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-5 pb-3 border-b border-border">Trust & Verification</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-surface/50">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Company Identity Verification</h3>
              <p className="text-sm text-text-secondary">Verify your identity to earn the Verified Badge and build trust with top-tier freelancers.</p>
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
