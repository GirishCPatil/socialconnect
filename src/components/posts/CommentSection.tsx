// ============================================
// SocialConnect - Comment Section Component
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface CommentSectionProps {
  postId: string;
  onCommentCountChange?: (delta: number) => void;
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Load comments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        onCommentCountChange?.(1);
      }
    } catch (err) {
      console.error('Submit comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        onCommentCountChange?.(-1);
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      {/* Comment List */}
      {isLoading ? (
        <p className="text-xs text-gray-500 py-2">Loading comments...</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
          {comments.length === 0 && (
            <p className="text-xs text-gray-500 py-2">No comments yet. Be the first to comment!</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2 group">
              <Link href={`/profile/${comment.author_id}`}>
                <Avatar className="h-7 w-7 mt-0.5">
                  <AvatarImage src={comment.author?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 text-white text-[10px]">
                    {`${comment.author?.first_name?.[0] || ''}${comment.author?.last_name?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${comment.author_id}`} className="text-xs font-semibold text-gray-300 hover:text-violet-400">
                      @{comment.author?.username}
                    </Link>
                    {comment.author_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(comment.id)}
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-transparent"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{comment.content}</p>
                </div>
                <p className="text-[10px] text-gray-600 mt-1 ml-3">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          maxLength={280}
          className="flex-1 h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newComment.trim() || isSubmitting}
          className="h-9 w-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
