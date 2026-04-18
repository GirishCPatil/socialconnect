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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get users this person follows
    const { data: following } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = following?.map(f => f.following_id) || [];

    let query;

    if (followingIds.length > 0) {
      // Personalized feed: posts from followed users + own posts
      const feedUserIds = [...followingIds, user.id];
      query = supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .in('author_id', feedUserIds);
    } else {
      // Fallback: show all public posts if not following anyone
      query = supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('is_active', true);
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Feed error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    // Get author details and like status
    const authorIds = [...new Set(posts?.map(p => p.author_id) || [])];
    const postIds = posts?.map(p => p.id) || [];

    const { data: authors } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', authorIds.length > 0 ? authorIds : ['none']);

    const { data: userLikes } = await supabaseAdmin
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds.length > 0 ? postIds : ['none']);

    const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
    const authorMap = new Map(authors?.map(a => [a.id, a]) || []);

    const enrichedPosts = posts?.map(post => ({
      ...post,
      author: authorMap.get(post.author_id) || null,
      is_liked: likedPostIds.has(post.id),
    })) || [];

    return NextResponse.json({
      data: enrichedPosts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
