// ============================================
// SocialConnect - User Card Component
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, UserMinus } from 'lucide-react';

interface UserCardProps {
  userData: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    bio?: string;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
  };
  showFollowButton?: boolean;
  isFollowing?: boolean;
}

export default function UserCard({ userData, showFollowButton = true, isFollowing: initialFollow = false }: UserCardProps) {
  const { user, token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollow);
  const [isLoading, setIsLoading] = useState(false);

  const isSelf = user?.id === userData.id;

  const handleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${userData.id}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-gray-900/50 backdrop-blur-sm p-4 transition-all hover:border-white/20">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${userData.id}`}>
          <Avatar className="h-12 w-12 ring-2 ring-violet-500/20">
            <AvatarImage src={userData.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm">
              {`${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${userData.id}`} className="hover:opacity-80">
            <p className="text-sm font-semibold text-white truncate">
              {userData.first_name} {userData.last_name}
            </p>
            <p className="text-xs text-gray-500">@{userData.username}</p>
          </Link>
          {userData.bio && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{userData.bio}</p>
          )}
        </div>

        {showFollowButton && !isSelf && (
          <Button
            onClick={handleFollow}
            disabled={isLoading}
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            className={
              isFollowing
                ? 'border-white/20 text-gray-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-3.5 w-3.5 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
