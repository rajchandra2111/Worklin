import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
  bucket?: string;
}

export function AvatarUpload({ url, onUpload, size = 100, bucket = 'avatars' }: AvatarUploadProps) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      // If it's an external URL (e.g. from Google Auth), use it directly
      if (path.startsWith('http')) {
        setAvatarUrl(path);
        return;
      }
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error: any) {
      console.error('Error downloading image: ', error.message);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user) {
        throw new Error('You must be logged in to upload an avatar.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      onUpload(filePath);
      downloadImage(filePath);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover border border-border bg-surface"
          style={{ width: size, height: size }}
        />
      ) : (
        <div 
          className="rounded-full bg-surface border border-border flex items-center justify-center text-text-muted"
          style={{ width: size, height: size }}
        >
          <Camera size={size * 0.4} strokeWidth={1.5} />
        </div>
      )}
      
      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
        {uploading ? (
          <Loader2 className="animate-spin text-white" size={24} />
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium">
            <Camera size={20} className="mb-1" />
            Upload
            <input
              style={{ display: 'none' }}
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
