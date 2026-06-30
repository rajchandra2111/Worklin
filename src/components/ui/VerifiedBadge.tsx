import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  verified?: boolean;
  size?: number;
  className?: string;
  showText?: boolean;
}

export function VerifiedBadge({ verified, size = 16, className = '', showText = false }: VerifiedBadgeProps) {
  if (!verified) return null;

  return (
    <div className={`inline-flex items-center gap-1 text-blue-500 ${className}`} title="Identity Verified">
      <BadgeCheck size={size} className="fill-blue-500 text-white" />
      {showText && <span className="text-xs font-semibold text-blue-600">Identity Verified</span>}
    </div>
  );
}
