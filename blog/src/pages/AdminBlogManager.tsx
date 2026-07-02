import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Edit2, Trash2, Plus, ArrowLeft, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';

export function AdminBlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [currentPost, setCurrentPost] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, [view]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name)')
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
    setLoading(false);
  };

  const handleEdit = (post: any) => {
    setCurrentPost(post);
    setView('edit');
  };

  const handleNew = () => {
    setCurrentPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: '',
      cover_image: '',
      published_at: null
    });
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const handleSave = async (publish: boolean) => {
    const postData = {
      ...currentPost,
      published_at: publish ? (currentPost.published_at || new Date().toISOString()) : null
    };

    if (currentPost.id) {
      // Update
      await supabase.from('blog_posts').update(postData).eq('id', currentPost.id);
    } else {
      // Insert
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('blog_posts').insert({
        ...postData,
        author_id: user?.id
      });
    }
    
    setView('list');
  };

  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-surface p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
              <ArrowLeft size={20} /> Back to Posts
            </button>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => handleSave(false)}>
                <Save size={16} className="mr-2" /> Save as Draft
              </Button>
              <Button variant="primary" onClick={() => handleSave(true)}>
                {currentPost.published_at ? 'Update Published Post' : 'Publish Now'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input 
                  type="text" 
                  value={currentPost.title}
                  onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                  className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  placeholder="The definitive guide to..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Markdown Content</label>
                <textarea 
                  value={currentPost.content}
                  onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                  className="w-full p-4 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none font-mono text-sm h-96"
                  placeholder="# Write your article here..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">URL Slug</label>
                <input 
                  type="text" 
                  value={currentPost.slug}
                  onChange={e => setCurrentPost({...currentPost, slug: e.target.value})}
                  className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  placeholder="how-to-hire"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <input 
                  type="text" 
                  value={currentPost.category}
                  onChange={e => setCurrentPost({...currentPost, category: e.target.value})}
                  className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  placeholder="For Freelancers"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Cover Image URL</label>
                <input 
                  type="text" 
                  value={currentPost.cover_image}
                  onChange={e => setCurrentPost({...currentPost, cover_image: e.target.value})}
                  className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Excerpt</label>
                <textarea 
                  value={currentPost.excerpt}
                  onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none h-24"
                  placeholder="A short 1-2 sentence summary..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-tenor font-bold text-text-primary">Blog Manager</h1>
            <p className="text-text-secondary mt-1">Manage all your articles from one place.</p>
          </div>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={18} className="mr-2" /> New Post
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-sm text-text-secondary">
                <th className="p-4 font-semibold">Post Details</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-text-muted">Loading posts...</td></tr>
              ) : posts.map(post => (
                <tr key={post.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-text-primary">{post.title}</p>
                    <p className="text-sm text-text-secondary">/{post.slug}</p>
                  </td>
                  <td className="p-4">
                    {post.published_at ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Published</span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 text-text-secondary hover:text-accent bg-surface rounded-lg">
                        <Eye size={18} />
                      </a>
                      <button onClick={() => handleEdit(post)} className="p-2 text-text-secondary hover:text-blue-500 bg-surface rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 text-text-secondary hover:text-red-500 bg-surface rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && posts.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-text-muted">No blog posts found. Create your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
