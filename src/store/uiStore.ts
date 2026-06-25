import { create } from 'zustand';

type AuthModalTab = 'login' | 'signup' | null;
type SignupRole = 'client' | 'freelancer' | null;

interface UiState {
  authModalTab: AuthModalTab;
  signupRole: SignupRole;
  openAuthModal: (tab: AuthModalTab, role?: SignupRole) => void;
  closeAuthModal: () => void;
  setSignupRole: (role: SignupRole) => void;
}

export const useUiStore = create<UiState>((set) => ({
  authModalTab: null,
  signupRole: null,
  openAuthModal: (tab, role = null) => set({ authModalTab: tab, signupRole: role }),
  closeAuthModal: () => set({ authModalTab: null, signupRole: null }),
  setSignupRole: (role) => set({ signupRole: role }),
}));
