import React, { useState } from 'react';
import { X, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface SubmitWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void>;
  contractTitle?: string;
}

export function SubmitWorkModal({ isOpen, onClose, onSubmit, contractTitle }: SubmitWorkModalProps) {
  const [links, setLinks] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!links.trim() && !notes.trim()) {
      setError('Please provide deliverable links or submission notes.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine links and notes into the submission_notes field
      let finalNotes = '';
      if (links.trim()) {
        finalNotes += `**Deliverable Links:**\n${links.trim()}\n\n`;
      }
      if (notes.trim()) {
        finalNotes += `**Notes:**\n${notes.trim()}`;
      }
      
      await onSubmit(finalNotes);
      setLinks('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-tenor">Submit Work</h2>
            {contractTitle && <p className="text-sm text-text-secondary mt-1">For: {contractTitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <LinkIcon size={16} className="text-text-secondary" />
              Deliverable Links
            </label>
            <textarea
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="e.g., Google Drive folder, Figma link, GitHub repo URL..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-sm min-h-[100px]"
            />
            <p className="text-xs text-text-secondary mt-1">Provide links to your final deliverables.</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <FileText size={16} className="text-text-secondary" />
              Submission Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any instructions, comments, or details the client needs to know..."
              className="w-full px-4 py-3 bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-sm min-h-[120px]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
