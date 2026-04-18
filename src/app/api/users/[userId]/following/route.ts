// ============================================
// GET /api/users/[userId]/following
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const { data: follows, error } = await supabaseAdmin
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get following error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    const followingIds = follows?.map(f => f.following_id) || [];

    if (followingIds.length === 0) {
      return NextResponse.json({ following: [] });
    }

    const { data: following } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url, bio')
      .in('id', followingIds);

    let enrichedFollowing = following || [];
    if (enrichedFollowing.length > 0) {
      const userIds = enrichedFollowing.map(u => u.id);
      const { data: followingList } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', userIds);

      const followingSet = new Set(followingList?.map(f => f.following_id) || []);
      
      enrichedFollowing = enrichedFollowing.map(u => ({
        ...u,
        is_following: followingSet.has(u.id)
      }));
    }

    return NextResponse.json({ following: enrichedFollowing });

  } catch (error) {
    console.error('Following error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
