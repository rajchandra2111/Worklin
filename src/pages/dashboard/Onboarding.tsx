import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Building2, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Onboarding() {
  const { user, role, fetchRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If not logged in, go to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If already onboarded (role is set explicitly and we don't need onboarding)
  // Wait, right now we default to 'client' in the SQL trigger. 
  // Let's rely on checking if the user metadata has a role set. 
  // If metadata doesn't have a role, it means they are fresh Google OAuth users.
  const hasMetadataRole = user.user_metadata?.role;
  if (hasMetadataRole) {
    // They already picked a role during signup, redirect to their dashboard
    return <Navigate to={`/${role || hasMetadataRole}/dashboard`} replace />;
  }

  const handleComplete = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Update auth metadata so we don't trigger onboarding again
      const { error: authError } = await supabase.auth.updateUser({
        data: { role: selectedRole }
      });
      if (authError) throw authError;

      // 2. Update public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ role: selectedRole })
        .eq('id', user.id);
        
      if (dbError) throw dbError;

      // 3. Update AuthContext state
      await fetchRole(user.id, selectedRole);

      // 4. Navigate to correct dashboard
      navigate(`/${selectedRole}/dashboard`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white max-w-[500px] w-full rounded-xl shadow-card p-10 text-center">
        <h1 className="text-3xl font-tenor font-bold mb-3">Welcome to Worklin_</h1>
        <p className="text-text-secondary mb-8">
          To get started, tell us how you want to use the platform.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md text-left">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div 
            className={`border-[1.5px] rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center ${
              selectedRole === 'client' 
                ? 'border-accent bg-accent-dim shadow-sm' 
                : 'border-border hover:border-accent hover:bg-accent-dim'
            }`}
            onClick={() => setSelectedRole('client')}
          >
            <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <div className="font-semibold mb-1">I'm a Client</div>
            <div className="text-xs text-text-muted">I want to hire freelancers</div>
          </div>

          <div 
            className={`border-[1.5px] rounded-lg p-6 cursor-pointer transition-all flex flex-col items-center justify-center ${
              selectedRole === 'freelancer' 
                ? 'border-accent bg-accent-dim shadow-sm' 
                : 'border-border hover:border-accent hover:bg-accent-dim'
            }`}
            onClick={() => setSelectedRole('freelancer')}
          >
            <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
              <Briefcase size={24} strokeWidth={1.5} />
            </div>
            <div className="font-semibold mb-1">I'm a Freelancer</div>
            <div className="text-xs text-text-muted">I want to find work</div>
          </div>
        </div>

        <Button 
          variant="primary" 
          className="w-full py-3" 
          disabled={!selectedRole || loading}
          onClick={handleComplete}
        >
          {loading ? 'Setting up...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
