// ============================================
// GET /api/users/[userId] - Get User Profile
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if current user follows this user
    const { data: followData } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', authUser.id)
      .eq('following_id', userId)
      .single();

    return NextResponse.json({
      user: { ...user, is_following: !!followData },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
