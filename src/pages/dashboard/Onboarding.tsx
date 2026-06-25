import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Building2, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Onboarding() {
  const { user, role, activeRole, verifyRole } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(
    (activeRole as 'client' | 'freelancer') || null
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // If not logged in, go to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If they already have the verified DB role for what they want to do, they shouldn't be here
  if (role && role === activeRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    setError(null);

    try {
      const table = selectedRole === 'client' ? 'client_profiles' : 'freelancer_profiles';
      const fullName = `${firstName} ${lastName}`.trim();

      const profileData: any = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        country: country,
      };

      if (selectedRole === 'client') {
        profileData.company_name = companyName;
      } else {
        profileData.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        profileData.hourly_rate = parseFloat(hourlyRate) || null;
      }

      // Insert into the respective profile table
      const { error: dbError } = await supabase
        .from(table)
        .insert([profileData]);
        
      if (dbError) throw dbError;

      // Update AuthContext state
      localStorage.setItem('activeRole', selectedRole);
      await verifyRole(user.id, selectedRole);
      
      // Navigate to correct dashboard
      navigate(`/${selectedRole}/dashboard`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete profile setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white max-w-[500px] w-full rounded-xl shadow-card p-10 text-center">
        <h1 className="text-3xl font-tenor font-bold mb-3">Complete Your Profile</h1>
        <p className="text-text-secondary mb-8">
          {selectedRole 
            ? `Let's set up your ${selectedRole === 'client' ? 'Client' : 'Freelancer'} account.`
            : 'To get started, tell us how you want to use the platform.'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md text-left">
            {error}
          </div>
        )}

        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div 
              className={`border-[1.5px] rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center border-border hover:border-accent hover:bg-accent-dim`}
              onClick={() => setSelectedRole('client')}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
                <Building2 size={24} strokeWidth={1.5} />
              </div>
              <div className="font-semibold mb-1">I'm a Client</div>
              <div className="text-xs text-text-muted">I want to hire freelancers</div>
            </div>

            <div 
              className={`border-[1.5px] rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center border-border hover:border-accent hover:bg-accent-dim`}
              onClick={() => setSelectedRole('freelancer')}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
                <Briefcase size={24} strokeWidth={1.5} />
              </div>
              <div className="font-semibold mb-1">I'm a Freelancer</div>
              <div className="text-xs text-text-muted">I want to find work</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleComplete} className="text-left space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First Name</label>
                <input 
                  type="text" 
                  required 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  required 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Country</label>
              <input 
                type="text" 
                required 
                value={country} 
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
              />
            </div>

            {selectedRole === 'client' && (
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Company Name (Optional)</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
                />
              </div>
            )}

            {selectedRole === 'freelancer' && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Skills (comma separated)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="React, Node.js, Design"
                    value={skills} 
                    onChange={e => setSkills(e.target.value)}
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Hourly Rate ($)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="50"
                    value={hourlyRate} 
                    onChange={e => setHourlyRate(e.target.value)}
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm outline-none focus:border-accent"
                  />
                </div>
              </>
            )}

            <Button 
              variant="primary" 
              className="w-full mt-4" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Profile'}
            </Button>
            
            {!activeRole && (
              <button 
                type="button" 
                onClick={() => setSelectedRole(null)}
                className="w-full mt-2 text-xs text-text-muted bg-transparent border-none cursor-pointer"
              >
                Go back
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
