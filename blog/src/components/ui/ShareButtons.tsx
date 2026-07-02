import { MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  image?: string;
}

export function ShareButtons({ url, title, image }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(image || '');

  const platforms = [
    {
      name: 'LinkedIn',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={18} />,
      href: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`
    },
    {
      name: 'Reddit',
      icon: <span className="font-bold text-sm">r/</span>,
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'Telegram',
      icon: <MessageCircle size={18} />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'Pinterest',
      icon: <span className="font-bold text-sm">P</span>,
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`
    },
    {
      name: 'Mix',
      icon: <span className="font-bold text-sm">M</span>,
      href: `https://mix.com/add?url=${encodedUrl}`
    }
  ];

  const handleCopyLink = (platformName: string) => {
    navigator.clipboard.writeText(url);
    alert(`Link copied! You can now paste it into ${platformName}.`);
  };

  return (
    <div className="py-8">
      <p className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
        Spread the love on these platforms
      </p>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-colors text-sm font-medium border border-border"
          >
            {platform.icon}
            {platform.name}
          </a>
        ))}
        
        <button
          onClick={() => handleCopyLink('Instagram')}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-colors text-sm font-medium border border-border"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          Instagram
        </button>
        <button
          onClick={() => handleCopyLink('Threads')}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-colors text-sm font-medium border border-border"
        >
          <span className="font-bold text-sm">@</span>
          Threads
        </button>
      </div>
    </div>
  );
}
