// ============================================
// SocialConnect - Feed Page
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/types';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/posts/PostForm';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setIsLoadingMore(true);
      
      const res = await fetch(`/api/feed?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (append) {
          setPosts(prev => [...prev, ...data.data]);
        } else {
          setPosts(data.data);
        }
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Load feed error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [token]);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Your Feed</h1>
        <p className="text-sm text-gray-500 mt-1">See what&apos;s happening in your network</p>
      </div>

      {/* Create Post */}
      <div className="mb-6">
        <PostForm onPostCreated={handlePostCreated} />
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-gray-900/50 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No posts yet</h3>
          <p className="text-sm text-gray-500">Be the first to share something or follow users to see their posts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDelete}
            />
          ))}

          {/* Load More */}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              >
                {isLoadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
