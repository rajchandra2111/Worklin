import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, ArrowLeft, Heart, MessageSquare, Share2, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ShareButtons } from '../components/ui/ShareButtons';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image: string;
  published_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

export function BlogPostDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPostDetails();
    }
  }, [slug]);

  useEffect(() => {
    if (post && user) {
      checkUserLike();
    }
  }, [post, user]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch Post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (postError) throw postError;
      setPost(postData as BlogPost);

      // 2. Fetch Comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('blog_comments')
        .select('id, content, created_at, user_id')
        .eq('post_id', postData.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // We will map over comments to attach mock names if we don't have a reliable join right now
      const enrichedComments = commentsData.map((c) => ({
        ...c,
        author_name: `User ${c.user_id.substring(0, 4)}` // Fallback since we can't cleanly join varying profiles yet
      }));
      setComments(enrichedComments);

      // 3. Fetch Likes Count
      const { count: likesData, error: likesError } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postData.id);

      if (likesError) throw likesError;
      setLikesCount(likesData || 0);

    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserLike = async () => {
    if (!post || !user) return;
    try {
      const { data } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      
      if (data) setHasLiked(true);
    } catch {
      // Not liked or error
      setHasLiked(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      window.location.href = 'https://hireworklin.com/login';
      return;
    }
    if (!post) return;

    try {
      if (hasLiked) {
        // Unlike
        await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setLikesCount(prev => prev - 1);
        setHasLiked(false);
      } else {
        // Like
        await supabase
          .from('blog_likes')
          .insert({ post_id: post.id, user_id: user.id });
        setLikesCount(prev => prev + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = 'https://hireworklin.com/login';
      return;
    }
    if (!post || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setComments([...comments, { ...data, author_name: 'You' }]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link to="/blog" className="text-accent hover:underline">Return to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header / Cover */}
      <div className="h-[40vh] min-h-[300px] max-h-[500px] w-full relative">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src={post.cover_image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-border">
          <div className="flex items-center justify-between mb-8">
            <span className="px-4 py-1.5 bg-surface text-text-secondary text-xs font-bold uppercase tracking-wider rounded-full">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-text-muted text-sm font-medium">
              <Clock size={16} /> {new Date(post.published_at).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="font-tenor text-3xl md:text-5xl font-bold text-text-primary mb-10 leading-tight">
            {post.title}
          </h1>

          {/* Simple Markdown Renderer for Content */}
          <div className="prose prose-lg max-w-none text-text-secondary">
            {post.content.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx} className="text-2xl font-bold text-text-primary mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('# ')) {
                return null; // Skip main title if it's in content
              }
              return paragraph.trim() ? <p key={idx} className="mb-6 leading-relaxed">{paragraph}</p> : null;
            })}
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-border">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${hasLiked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'}`}
            >
              <Heart size={20} className={hasLiked ? 'fill-current' : ''} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <MessageSquare size={20} />
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </div>
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary ml-auto">
              <Share2 size={20} /> Share
            </button>
          </div>

          <ShareButtons url={window.location.href} title={post.title} image={post.cover_image} />
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-tenor font-bold text-text-primary mb-8">Comments ({comments.length})</h3>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-10">
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Write a comment..." : "Log in to join the conversation..."}
                className="w-full min-h-[100px] resize-none outline-none text-text-primary bg-transparent"
                disabled={submittingComment}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="primary" 
                  disabled={submittingComment || !newComment.trim() && user !== null}
                  className="flex items-center gap-2"
                >
                  <Send size={16} /> {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-white p-6 rounded-xl border border-border flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface text-text-secondary flex items-center justify-center font-bold shrink-0">
                    {comment.author_name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm text-text-primary">{comment.author_name}</span>
                      <span className="text-xs text-text-muted">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
