import { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Building2, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AuthModal() {
  const { authModalTab, signupRole, closeAuthModal, openAuthModal, setSignupRole } = useUiStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAuthModal]);

  useEffect(() => {
    setError(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  }, [authModalTab]);

  if (!authModalTab) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const intendedRole = signupRole || 'client';
      localStorage.setItem('activeRole', intendedRole);
      
      closeAuthModal();
      
      // We don't navigate directly here anymore. AuthContext will verify the role 
      // and update the state, which then causes Home.tsx or App.tsx to redirect safely.
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!firstName || !lastName) {
      setError('Please provide your first and last name');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            // We don't need role in metadata anymore, but we can keep it as default
            role: signupRole || 'client',
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('This email is already registered. Please click "Log in" below to sign into your existing account, where you can then easily switch roles or create your other profile.');
        }
        throw error;
      }
      
      const intendedRole = signupRole || 'client';
      localStorage.setItem('activeRole', intendedRole);
      
      closeAuthModal();
      // AuthContext will handle the redirect
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const intendedRole = signupRole || 'client';
      localStorage.setItem('activeRole', intendedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="bg-white rounded-xl p-10 w-full max-w-[440px] relative shadow-card">
        <button 
          className="absolute top-4 right-4 bg-none border-none text-[22px] cursor-pointer text-text-muted hover:text-text-primary transition-colors"
          onClick={closeAuthModal}
        >
          ✕
        </button>

        {authModalTab === 'login' && (
          <form onSubmit={handleLogin}>
            <h3 className="text-[22px] font-bold mb-1.5">Welcome back</h3>
            <p className="text-sm text-text-secondary mb-6">Log in to your <span className="font-tenor font-semibold tracking-widest text-primary">Worklin_</span> account</p>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div 
                className={`border-[1.5px] rounded-md p-3 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'client' || !signupRole ? 'border-accent bg-accent-dim shadow-sm shadow-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent-dim/50'}`}
                onClick={() => setSignupRole('client')}
              >
                <div className="text-[13px] font-semibold text-primary">Log in as Client</div>
              </div>
              <div 
                className={`border-[1.5px] rounded-md p-3 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'freelancer' ? 'border-accent bg-accent-dim shadow-sm shadow-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent-dim/50'}`}
                onClick={() => setSignupRole('freelancer')}
              >
                <div className="text-[13px] font-semibold text-primary">Log in as Freelancer</div>
              </div>
            </div>

            <button type="button" onClick={handleGoogleAuth} className="w-full p-[11px] border-[1.5px] border-border rounded-md bg-white font-inherit text-sm font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface">
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-3 my-4 text-text-muted text-sm before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
              or
            </div>
            
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                required 
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                required 
              />
            </div>
            
            <Button variant="primary" className="w-full mt-1" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            
            <div className="text-xs text-text-muted text-center mt-3.5">
              No account? <button type="button" className="text-accent border-none bg-transparent cursor-pointer font-medium" onClick={() => openAuthModal('signup')}>Sign up free</button>
            </div>
          </form>
        )}

        {authModalTab === 'signup' && (
          <form onSubmit={handleSignup}>
            <h3 className="text-[22px] font-bold mb-1.5">Create your account</h3>
            <p className="text-sm text-text-secondary mb-6">I want to...</p>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div 
                className={`border-[1.5px] rounded-md p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'client' || !signupRole ? 'border-accent bg-accent-dim shadow-sm shadow-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent-dim/50'}`}
                onClick={() => setSignupRole('client')}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-2.5 shadow-sm">
                  <Building2 size={20} strokeWidth={1.5} />
                </div>
                <div className="text-[13px] font-semibold mb-0.5 text-primary">Client</div>
                <div className="text-[11px] text-text-muted">Post projects</div>
              </div>
              <div 
                className={`border-[1.5px] rounded-md p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'freelancer' ? 'border-accent bg-accent-dim shadow-sm shadow-accent/10' : 'border-border hover:border-accent/50 hover:bg-accent-dim/50'}`}
                onClick={() => setSignupRole('freelancer')}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-2.5 shadow-sm">
                  <Briefcase size={20} strokeWidth={1.5} />
                </div>
                <div className="text-[13px] font-semibold mb-0.5 text-primary">Freelancer</div>
                <div className="text-[11px] text-text-muted">Find work</div>
              </div>
            </div>

            <button type="button" onClick={handleGoogleAuth} className="w-full p-[11px] border-[1.5px] border-border rounded-md bg-white font-inherit text-sm font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface">
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-3 my-4 text-text-muted text-sm before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
              or
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sara" 
                  className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Molin" 
                  className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                  required 
                />
              </div>
            </div>
            
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                required 
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" 
                className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" 
                required 
                minLength={8}
              />
            </div>
            
            <Button variant="primary" className="w-full mt-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </Button>
            
            <div className="text-xs text-text-muted text-center mt-3">
              By signing up you agree to our <a href="#" className="text-accent no-underline">Terms</a> & <a href="#" className="text-accent no-underline">Privacy Policy</a>
            </div>
            <div className="text-xs text-text-muted text-center mt-2">
              Have an account? <button type="button" className="text-accent border-none bg-transparent cursor-pointer font-medium" onClick={() => openAuthModal('login')}>Log in</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="currentColor"/>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="currentColor"/>
      <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="currentColor"/>
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" fill="currentColor"/>
    </svg>
  );
}
