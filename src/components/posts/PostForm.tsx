// ============================================
// SocialConnect - Post Creation Form
// ============================================

'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface PostFormProps {
  onPostCreated: (post: Post) => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPEG and PNG formats are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        alert('Failed to upload image');
        setImagePreview('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
      setImagePreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          image_url: imageUrl || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onPostCreated(data.post);
        setContent('');
        setImageUrl('');
        setImagePreview('');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Create post error:', err);
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-white/10 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-violet-500/30">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
              {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={280}
              rows={3}
              className="resize-none bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 p-0 text-sm"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="max-h-48 rounded-xl object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeImage}
                  className="absolute top-1 right-1 h-6 w-6 bg-black/60 hover:bg-black/80 text-white rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 gap-2"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-xs">Photo</span>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${content.length > 260 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {content.length}/280
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || isSubmitting || isUploading}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium px-6 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
