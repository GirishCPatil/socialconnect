// ============================================
// GET /api/posts - List All Posts
// POST /api/posts - Create Post
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { createPostSchema } from '@/lib/validations';

// Get all posts (paginated, chronological)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const authorId = searchParams.get('author_id');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('List posts error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    // Get author details and like status for each post
    const authorIds = [...new Set(posts?.map(p => p.author_id) || [])];
    const postIds = posts?.map(p => p.id) || [];

    const { data: authors } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', authorIds);

    const { data: userLikes } = await supabaseAdmin
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

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
    console.error('Posts error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Create a new post (same pattern as addExpense)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createPostSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, image_url } = validated.data;

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        content,
        author_id: user.id,
        image_url: image_url || '',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create post error:', error);
      return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
    }

    // Increment user's posts_count
    await supabaseAdmin
      .from('users')
      .update({ posts_count: (user.posts_count || 0) + 1 })
      .eq('id', user.id);

    return NextResponse.json(
      { message: 'Post created successfully', post: { ...post, author: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name, avatar_url: user.avatar_url }, is_liked: false } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
