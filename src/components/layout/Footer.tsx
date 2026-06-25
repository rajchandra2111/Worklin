import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-white/60 pt-12 pb-7 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center text-sm gap-4">
          <div className="flex items-center gap-3">
            <img src="/worklin_dark.png" alt="Worklin" className="h-5 opacity-90 hover:opacity-100 transition-opacity" />
            <span>© 2025 · <Link to="/" className="text-white/40 hover:text-white transition-colors ml-1">Home</Link></span>
          </div>
          <div className="flex gap-4">
            <Link to="#" className="text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="text-white/40 hover:text-white transition-colors">Terms</Link>
            <Link to="#" className="text-white/40 hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
