// ============================================
// GET /api/users/[userId]/followers
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
      .select('follower_id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get followers error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    // Get follower user details
    const followerIds = follows?.map(f => f.follower_id) || [];
    
    if (followerIds.length === 0) {
      return NextResponse.json({ followers: [] });
    }

    const { data: followers } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url, bio')
      .in('id', followerIds);

    let enrichedFollowers = followers || [];
    if (enrichedFollowers.length > 0) {
      const userIds = enrichedFollowers.map(u => u.id);
      const { data: followingList } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', userIds);

      const followingSet = new Set(followingList?.map(f => f.following_id) || []);
      
      enrichedFollowers = enrichedFollowers.map(u => ({
        ...u,
        is_following: followingSet.has(u.id)
      }));
    }

    return NextResponse.json({ followers: enrichedFollowers });

  } catch (error) {
    console.error('Followers error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
