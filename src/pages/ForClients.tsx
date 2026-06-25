import { useUiStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';

export function ForClients() {
  const { openAuthModal } = useUiStore();
  return (
    <div className="py-20 px-6 max-w-[1200px] mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">For Clients</p>
      <h1 className="text-4xl md:text-5xl font-tenor font-normal uppercase tracking-[0.08em] mb-6">Find the perfect freelance services for your business</h1>
      <p className="text-lg text-text-secondary mb-10 max-w-[600px] mx-auto">Get your projects done by vetted experts on a secure, escrow-backed platform.</p>
      <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'client')}>Post a project — it's free</Button>
    </div>
  );
}
