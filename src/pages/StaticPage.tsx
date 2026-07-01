export function StaticPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-6 text-center">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wide uppercase mb-6">
        Coming Soon
      </span>
      <h1 className="text-4xl md:text-5xl font-tenor font-bold text-text-primary mb-4 tracking-tight">
        {title}
      </h1>
      <p className="text-lg text-text-secondary max-w-xl mx-auto">
        {description || `We are currently working on our ${title} page. Check back soon for updates!`}
      </p>
    </div>
  );
}
