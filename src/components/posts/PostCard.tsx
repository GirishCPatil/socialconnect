// ============================================
// SocialConnect - Post Card Component
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onLikeToggle?: (postId: string, isLiked: boolean) => void;
}

export default function PostCard({ post, onDelete, onLikeToggle }: PostCardProps) {
  const { user, token } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = user?.id === post.author_id;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLikeToggle?.(post.id, !isLiked);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onDelete?.(post.id);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getInitials = () => {
    return `${post.author?.first_name?.[0] || ''}${post.author?.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="border-white/10 bg-gray-900/50 backdrop-blur-sm overflow-hidden transition-all hover:border-white/20">
      <div className="p-4">
        {/* Author Header */}
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${post.author_id}`} className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10 ring-2 ring-violet-500/30">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
                {post.author?.first_name} {post.author?.last_name}
              </p>
              <p className="text-xs text-gray-500">
                @{post.author?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-white/10 outline-none border-none bg-transparent cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Content */}
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {post.content}
        </p>

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-3 overflow-hidden rounded-xl">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-96 object-cover transition-transform hover:scale-105"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`gap-2 transition-all ${
              isLiked
                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 text-gray-500 hover:text-sky-400 hover:bg-sky-500/10"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{commentCount}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            onCommentCountChange={(delta) => setCommentCount(prev => prev + delta)}
          />
        )}
      </div>
    </Card>
  );
}
