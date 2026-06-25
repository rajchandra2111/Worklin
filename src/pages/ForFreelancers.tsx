import { useUiStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';

export function ForFreelancers() {
  const { openAuthModal } = useUiStore();
  return (
    <div className="py-20 px-6 max-w-[1200px] mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
      <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-2.5">For Freelancers</p>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Find rewarding projects and grow your freelance career</h1>
      <p className="text-lg text-text-secondary mb-10 max-w-[600px] mx-auto">Join thousands of businesses hiring on <span className="font-tenor font-semibold tracking-tight text-primary">Worklin_</span>. Low fees, guaranteed payments, and a global talent pool.</p>
      <Button size="lg" variant="primary" onClick={() => openAuthModal('signup', 'freelancer')}>Join as a freelancer</Button>
    </div>
  );
}
