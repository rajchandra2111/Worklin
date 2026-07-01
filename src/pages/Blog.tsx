import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Clock, ChevronRight, Mail } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string;
  published_at: string;
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts((data as BlogPost[]) || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 text-center bg-surface">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">The Worklin_ Blog</p>
          <h1 className="font-tenor text-4xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            Insights, guides, and stories from the future of work.
          </h1>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-6 py-12 max-w-7xl mx-auto">
          <Link to={`/blog/${featuredPost.slug}`} className="group block">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center bg-white rounded-3xl overflow-hidden border border-border shadow-sm transition-shadow hover:shadow-md">
              <div className="h-full min-h-[300px] md:min-h-[400px]">
                <img 
                  src={featuredPost.cover_image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-12">
                <span className="inline-block px-3 py-1 bg-surface text-text-secondary text-xs font-semibold rounded-full mb-6">
                  {featuredPost.category || 'Featured'}
                </span>
                <h2 className="font-tenor font-bold text-3xl md:text-4xl text-text-primary mb-4 group-hover:text-accent transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-text-secondary text-lg leading-relaxed mb-8 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-text-primary">
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-text-muted"/> 5 min read</span>
                  <span className="flex items-center gap-1 text-accent group-hover:underline underline-offset-4">Read Article <ChevronRight size={16} /></span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts Grid */}
      {remainingPosts.length > 0 && (
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-tenor font-bold text-text-primary">Recent Articles</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="aspect-16/10 overflow-hidden">
                  <img 
                    src={post.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=800&q=80'} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col grow">
                  <span className="inline-block px-3 py-1 bg-surface text-text-secondary text-[10px] font-semibold rounded-full mb-4 w-fit">
                    {post.category || 'Article'}
                  </span>
                  <h4 className="font-bold text-xl text-text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2 grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-text-muted mt-auto">
                    <Clock size={14} /> 4 min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-24 px-6 mt-12 bg-primary text-white border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-tenor font-bold mb-6">Never miss an update</h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Get the best independent work insights, platform updates, and hiring strategies delivered straight to your inbox.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="grow px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
              required
            />
            <Button size="lg" variant="primary" type="submit" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
      
    </div>
  );
}
