// ============================================
// SocialConnect - User Profile Page
// ============================================

'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PostCard from '@/components/posts/PostCard';
import UserCard from '@/components/profile/UserCard';
import { MapPin, LinkIcon, Calendar, UserPlus, UserMinus, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: authUser, token } = useAuth();
  const [profile, setProfile] = useState<User & { is_following?: boolean } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<(User & { is_following?: boolean })[]>([]);
  const [following, setFollowing] = useState<(User & { is_following?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isSelf = authUser?.id === userId;

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsFollowing(data.user.is_following || false);
      }
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`/api/posts?author_id=${userId}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data);
      }
    } catch (err) {
      console.error('Load posts error:', err);
    }
  };

  const loadFollowers = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers);
      }
    } catch (err) {
      console.error('Load followers error:', err);
    }
  };

  const loadFollowing = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } catch (err) {
      console.error('Load following error:', err);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'followers' && followers.length === 0) loadFollowers();
    if (tab === 'following' && following.length === 0) loadFollowing();
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setProfile(prev => prev ? {
          ...prev,
          followers_count: isFollowing
            ? Math.max(0, (prev.followers_count || 1) - 1)
            : (prev.followers_count || 0) + 1
        } : null);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="border-white/10 bg-gray-900/50 backdrop-blur-sm overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-pink-600/30" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <Avatar className="h-24 w-24 ring-4 ring-gray-900 shadow-xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl">
                {`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`}
              </AvatarFallback>
            </Avatar>

            {isSelf ? (
              <Button asChild variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5">
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                className={
                  isFollowing
                    ? 'border-white/20 bg-transparent text-gray-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 border'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {/* User Info */}
          <h2 className="text-xl font-bold text-white">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-sm text-gray-500">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-gray-300 mt-3">{profile.bio}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-400 hover:text-violet-300">
                <LinkIcon className="h-3.5 w-3.5" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <button onClick={() => handleTabChange('posts')} className="hover:opacity-80">
              <span className="text-white font-bold">{profile.posts_count || 0}</span>
              <span className="text-gray-500 text-sm ml-1">Posts</span>
            </button>
            <button onClick={() => handleTabChange('followers')} className="hover:opacity-80">
              <span className="text-white font-bold">{profile.followers_count || 0}</span>
              <span className="text-gray-500 text-sm ml-1">Followers</span>
            </button>
            <button onClick={() => handleTabChange('following')} className="hover:opacity-80">
              <span className="text-white font-bold">{profile.following_count || 0}</span>
              <span className="text-gray-500 text-sm ml-1">Following</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-gray-900/50 border border-white/10 w-full">
          <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Posts</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Followers</TabsTrigger>
          <TabsTrigger value="following" className="flex-1 data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No posts yet</p>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handlePostDelete} />
            ))
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-4 space-y-3">
          {followers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No followers yet</p>
          ) : (
            followers.map(f => (
              <UserCard key={f.id} userData={f} isFollowing={f.is_following} />
            ))
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4 space-y-3">
          {following.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Not following anyone</p>
          ) : (
            following.map(f => (
              <UserCard key={f.id} userData={f} isFollowing={f.is_following} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
