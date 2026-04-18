// ============================================
// GET /api/users - List All Users
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, bio, avatar_url, posts_count, followers_count, following_count', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('List users error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    // Look up following status
    let enrichedUsers = users || [];
    if (enrichedUsers.length > 0) {
      const userIds = enrichedUsers.map(u => u.id);
      const { data: followingList } = await supabaseAdmin
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', userIds);

      const followingSet = new Set(followingList?.map(f => f.following_id) || []);
      
      enrichedUsers = enrichedUsers.map(u => ({
        ...u,
        is_following: followingSet.has(u.id)
      }));
    }

    return NextResponse.json({
      data: enrichedUsers,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error) {
    console.error('Users error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
