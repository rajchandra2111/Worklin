import { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Building2, Briefcase, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AuthModal() {
  const { authModalTab, signupRole, closeAuthModal, openAuthModal, setSignupRole } = useUiStore();

  const [step, setStep] = useState<'selection' | 'form'>('selection');

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
    
    // If a role was pre-selected (e.g. clicking "Join as Freelancer"), skip the selection step
    if (useUiStore.getState().signupRole) {
      setStep('form');
    } else {
      setStep('selection');
    }
  }, [authModalTab]);

  if (!authModalTab) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const intendedRole = signupRole || 'client';
      localStorage.setItem('activeRole', intendedRole);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      closeAuthModal();
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
      const intendedRole = signupRole || 'client';
      localStorage.setItem('activeRole', intendedRole);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            role: intendedRole,
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
      
      closeAuthModal();
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="bg-white rounded-[20px] p-10 w-full max-w-[440px] relative shadow-float transition-all duration-300">
        <button 
          className="absolute top-5 right-5 bg-surface hover:bg-border w-8 h-8 rounded-full border-none text-[18px] flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary transition-colors"
          onClick={closeAuthModal}
        >
          ✕
        </button>

        {step === 'selection' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[26px] font-tenor font-bold mb-2 text-center text-primary">
              {authModalTab === 'login' ? 'Welcome back' : 'Join Worklin_'}
            </h3>
            <p className="text-sm text-text-secondary mb-8 text-center">
              {authModalTab === 'login' ? 'How would you like to log in today?' : 'How do you want to use the platform?'}
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div 
                className="border-[1.5px] border-border hover:border-accent hover:bg-[#F8EAE5] rounded-xl p-6 cursor-pointer transition-all flex items-center gap-5 group"
                onClick={() => {
                  setSignupRole('client');
                  setStep('form');
                }}
              >
                <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-surface group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-border flex items-center justify-center text-primary transition-all">
                  <Building2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-base font-semibold mb-0.5 text-primary">I'm a Client</div>
                  <div className="text-sm text-text-muted">I want to hire expert freelancers</div>
                </div>
              </div>

              <div 
                className="border-[1.5px] border-border hover:border-accent hover:bg-[#F8EAE5] rounded-xl p-6 cursor-pointer transition-all flex items-center gap-5 group"
                onClick={() => {
                  setSignupRole('freelancer');
                  setStep('form');
                }}
              >
                <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-surface group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-border flex items-center justify-center text-primary transition-all">
                  <Briefcase size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-base font-semibold mb-0.5 text-primary">I'm a Freelancer</div>
                  <div className="text-sm text-text-muted">I want to find high-quality work</div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-center mt-8 text-text-secondary pt-6 border-t border-border">
              {authModalTab === 'login' ? (
                <>No account? <button type="button" className="text-accent font-semibold border-none bg-transparent cursor-pointer ml-1 hover:underline" onClick={() => openAuthModal('signup')}>Sign up free</button></>
              ) : (
                <>Already have an account? <button type="button" className="text-accent font-semibold border-none bg-transparent cursor-pointer ml-1 hover:underline" onClick={() => openAuthModal('login')}>Log in</button></>
              )}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              type="button" 
              onClick={() => setStep('selection')}
              className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer mb-6 p-1 -ml-1 rounded-md hover:bg-surface"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {authModalTab === 'login' ? (
              <form onSubmit={handleLogin}>
                <h3 className="text-[24px] font-tenor font-bold mb-1.5 text-primary">
                  Log in as {signupRole === 'client' ? 'Client' : 'Freelancer'}
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  {signupRole === 'client' ? 'Ready to hire top talent?' : 'Ready to find your next big project?'}
                </p>
                
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

                <button type="button" onClick={handleGoogleAuth} className="w-full p-3 border-[1.5px] border-border rounded-lg bg-white font-inherit text-[14px] font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface shadow-sm">
                  <GoogleIcon />
                  Continue with Google
                </button>
                
                <div className="flex items-center gap-3 my-5 text-text-muted text-xs font-medium uppercase tracking-wider before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
                  Or use email
                </div>
                
                <div className="mb-4">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                    required 
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                    required 
                  />
                </div>
                
                <Button variant="primary" className="w-full py-3 text-[15px]" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in securely'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <h3 className="text-[24px] font-tenor font-bold mb-1.5 text-primary">
                  Sign up as {signupRole === 'client' ? 'Client' : 'Freelancer'}
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  {signupRole === 'client' ? 'Find and hire the best freelancers.' : 'Find high-quality projects and clients.'}
                </p>
                
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

                <button type="button" onClick={handleGoogleAuth} className="w-full p-3 border-[1.5px] border-border rounded-lg bg-white font-inherit text-[14px] font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface shadow-sm">
                  <GoogleIcon />
                  Continue with Google
                </button>
                
                <div className="flex items-center gap-3 my-5 text-text-muted text-xs font-medium uppercase tracking-wider before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
                  Or use email
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane" 
                      className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe" 
                      className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                    required 
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" 
                    className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-lg font-inherit text-[14px] text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-dim" 
                    required 
                    minLength={8}
                  />
                </div>
                
                <Button variant="primary" className="w-full py-3 text-[15px]" disabled={loading}>
                  {loading ? 'Creating...' : 'Create account'}
                </Button>
                
                <div className="text-xs text-text-muted text-center mt-4">
                  By signing up you agree to our <a href="#" className="text-accent no-underline hover:underline">Terms</a> & <a href="#" className="text-accent no-underline hover:underline">Privacy Policy</a>
                </div>
              </form>
            )}
          </div>
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
