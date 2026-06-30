import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PortfolioImageUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function PortfolioImageUpload({ url, onUpload, onRemove }: PortfolioImageUploadProps) {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
    else setImageUrl(null);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      if (path.startsWith('http')) {
        setImageUrl(path);
        return;
      }
      const { data, error } = await supabase.storage.from('portfolios').download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setImageUrl(url);
    } catch (error: any) {
      console.error('Error downloading image: ', error.message);
    }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      if (!user) {
        throw new Error('You must be logged in to upload an image.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/portfolio_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      onUpload(filePath);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative w-full h-40 bg-surface rounded-t-lg border-b border-border overflow-hidden flex items-center justify-center group">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Portfolio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <label className="cursor-pointer bg-white text-text-primary px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Change Image
              <input style={{ display: 'none' }} type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
            </label>
            <button type="button" onClick={onRemove} className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </>
      ) : (
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-text-muted hover:text-accent hover:bg-accent/5 transition-colors">
          {uploading ? (
            <Loader2 className="animate-spin text-accent" size={28} />
          ) : (
            <>
              <ImagePlus size={28} className="mb-2" />
              <span className="text-sm font-medium">Add Project Cover Image</span>
              <input style={{ display: 'none' }} type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
            </>
          )}
        </label>
      )}
    </div>
  );
}
