import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function PostProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    budget_type: 'fixed',
    budget: '',
    timeline: '1-3 months',
    skills: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const { error: insertError } = await supabase.from('projects').insert([{
        client_id: user.id,
        title: formData.title,
        category: formData.category,
        budget_type: formData.budget_type,
        budget: parseFloat(formData.budget),
        timeline: formData.timeline,
        skills: skillsArray,
        description: formData.description,
        status: 'open'
      }]);

      if (insertError) throw insertError;

      // Redirect to dashboard on success
      navigate('/client/dashboard');
    } catch (err: any) {
      console.error('Error posting project:', err);
      setError(err.message || 'Failed to post project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/client/dashboard')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
        <h1 className="text-[28px] font-tenor font-bold mb-2">Post a New Project</h1>
        <p className="text-text-secondary mb-8">Fill out the details below to find the perfect expert for your job.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">Project Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Build a responsive React dashboard"
              className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] bg-white"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Content Writing">Content Writing</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">Timeline</label>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] bg-white"
              >
                <option value="Less than 1 month">Less than 1 month</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="More than 6 months">More than 6 months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">Budget Type</label>
              <select
                name="budget_type"
                value={formData.budget_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] bg-white"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-primary">Budget Amount ($)</label>
              <input
                type="number"
                name="budget"
                required
                min="1"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                placeholder={formData.budget_type === 'fixed' ? 'e.g. 1500' : 'e.g. 45'}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">Required Skills</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Figma (comma separated)"
              className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-primary">Project Description</label>
            <textarea
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project in detail..."
              className="w-full px-4 py-3 rounded-lg border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-[15px] resize-y"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/client/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="min-w-[140px]">
              {loading ? 'Publishing...' : 'Publish Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
