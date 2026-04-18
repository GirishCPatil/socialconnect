// ============================================
// SocialConnect - Landing Page
// ============================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, MessageSquare, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/feed');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Gradient + Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
              <span className="text-sm font-bold text-white">SC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              SocialConnect
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8">
            <Zap className="h-3.5 w-3.5" />
            <span>Your Social Space Awaits</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight">
            <span className="text-white">Connect with the</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              World Around You
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mt-6 leading-relaxed">
            Share your thoughts, discover amazing content, and build meaningful connections.
            Join thousands of users already on SocialConnect.
          </p>

          <div className="flex items-center gap-4 mt-10">
            <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-8 h-12 shadow-xl shadow-violet-500/25">
              <Link href="/register">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-gray-300 hover:bg-white/5 h-12 px-8">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
            <div className="group p-6 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-violet-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                <MessageSquare className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Posts</h3>
              <p className="text-sm text-gray-400">Express yourself with text and images. Share what matters to you with the world.</p>
            </div>

            <div className="group p-6 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-fuchsia-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/20 transition-colors">
                <Users className="h-6 w-6 text-fuchsia-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Build Connections</h3>
              <p className="text-sm text-gray-400">Follow people you admire and build a community that inspires you every day.</p>
            </div>

            <div className="group p-6 rounded-2xl bg-gray-900/50 border border-white/5 hover:border-pink-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Engage & Interact</h3>
              <p className="text-sm text-gray-400">Like, comment, and interact with posts from the community. Your voice matters.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
