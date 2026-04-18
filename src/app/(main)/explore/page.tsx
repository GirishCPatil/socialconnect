// ============================================
// SocialConnect - Explore Page (Discover Users)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserCard from '@/components/profile/UserCard';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export default function ExplorePage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadUsers = async (searchQuery = '') => {
    try {
      setIsLoading(true);
      const url = searchQuery
        ? `/api/users?search=${encodeURIComponent(searchQuery)}&limit=50`
        : '/api/users?limit=50';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Filter out self
        setUsers(data.data.filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => loadUsers(value), 400));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Explore</h1>
        <p className="text-sm text-gray-500 mt-1">Discover and connect with new people</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by name or username..."
          className="pl-10 bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500/50"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-gray-900/50 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">
            {search ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {search ? 'Try a different search term' : 'Be the first to invite your friends!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <UserCard key={u.id} userData={u} isFollowing={u.is_following} />
          ))}
        </div>
      )}
    </div>
  );
}
