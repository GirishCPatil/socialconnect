// ============================================
// SocialConnect - Navbar Component
// ============================================

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Search, PlusSquare, User, LogOut, Compass } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <span className="text-sm font-bold text-white">SC</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            SocialConnect
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white hover:bg-white/10">
            <Link href="/feed">
              <Home className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white hover:bg-white/10">
            <Link href="/explore">
              <Compass className="h-5 w-5" />
            </Link>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-violet-500/50 outline-none border-none bg-transparent cursor-pointer flex items-center justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-white/10 text-white">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400">@{user?.username}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => router.push(`/profile/${user?.id}`)}
                className="cursor-pointer text-gray-300 hover:text-white focus:bg-white/10 focus:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/profile/edit')}
                className="cursor-pointer text-gray-300 hover:text-white focus:bg-white/10 focus:text-white"
              >
                <PlusSquare className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-400 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
