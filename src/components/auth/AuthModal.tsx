import { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Building2, Briefcase } from 'lucide-react';

export function AuthModal() {
  const { authModalTab, signupRole, closeAuthModal, openAuthModal, setSignupRole } = useUiStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAuthModal]);

  if (!authModalTab) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-1000 flex items-center justify-center p-5"
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
          <div>
            <h3 className="text-[22px] font-bold mb-1.5">Welcome back</h3>
            <p className="text-sm text-text-secondary mb-6">Log in to your <span className="font-tenor font-semibold tracking-tight text-primary">Worklin_</span> account</p>
            
            <button className="w-full p-[11px] border-[1.5px] border-border rounded-md bg-white font-inherit text-sm font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface">
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-3 my-4 text-text-muted text-sm before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
              or
            </div>
            
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
            </div>
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <input type="password" placeholder="••••••••" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
            </div>
            
            <Button variant="primary" className="w-full mt-1">Log in</Button>
            
            <div className="text-xs text-text-muted text-center mt-3.5">
              No account? <button className="text-accent border-none bg-transparent cursor-pointer font-medium" onClick={() => openAuthModal('signup')}>Sign up free</button>
            </div>
          </div>
        )}

        {authModalTab === 'signup' && (
          <div>
            <h3 className="text-[22px] font-bold mb-1.5">Create your account</h3>
            <p className="text-sm text-text-secondary mb-6">I want to...</p>
            
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div 
                className={`border-[1.5px] rounded-md p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'client' ? 'border-accent bg-accent-dim' : 'border-border hover:border-accent hover:bg-accent-dim'}`}
                onClick={() => setSignupRole('client')}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-2.5 shadow-sm">
                  <Building2 size={20} strokeWidth={1.5} />
                </div>
                <div className="text-[13px] font-semibold mb-0.5">Client</div>
                <div className="text-[11px] text-text-muted">Post projects</div>
              </div>
              <div 
                className={`border-[1.5px] rounded-md p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center ${signupRole === 'freelancer' ? 'border-accent bg-accent-dim' : 'border-border hover:border-accent hover:bg-accent-dim'}`}
                onClick={() => setSignupRole('freelancer')}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary mb-2.5 shadow-sm">
                  <Briefcase size={20} strokeWidth={1.5} />
                </div>
                <div className="text-[13px] font-semibold mb-0.5">Freelancer</div>
                <div className="text-[11px] text-text-muted">Find work</div>
              </div>
            </div>

            <button className="w-full p-[11px] border-[1.5px] border-border rounded-md bg-white font-inherit text-sm font-medium text-text-primary cursor-pointer mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-surface">
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-3 my-4 text-text-muted text-sm before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
              or
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First name</label>
                <input type="text" placeholder="Sara" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last name</label>
                <input type="text" placeholder="Molin" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
              </div>
            </div>
            
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
            </div>
            <div className="mb-3.5">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <input type="password" placeholder="Min. 8 characters" className="w-full p-[11px] px-3.5 border-[1.5px] border-border rounded-md font-inherit text-sm text-text-primary outline-none transition-colors focus:border-accent" />
            </div>
            
            <Button variant="primary" className="w-full mt-1">Create account</Button>
            
            <div className="text-xs text-text-muted text-center mt-3">
              By signing up you agree to our <a href="#" className="text-accent no-underline">Terms</a> & <a href="#" className="text-accent no-underline">Privacy Policy</a>
            </div>
            <div className="text-xs text-text-muted text-center mt-2">
              Have an account? <button className="text-accent border-none bg-transparent cursor-pointer font-medium" onClick={() => openAuthModal('login')}>Log in</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
      <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" fill="#EA4335"/>
    </svg>
  );
}
