// ============================================
// POST/DELETE /api/posts/[postId]/like
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

// Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    // Check post exists
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id, like_count')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already liked this post' }, { status: 409 });
    }

    // Create like
    const { error } = await supabaseAdmin
      .from('likes')
      .insert({ user_id: user.id, post_id: postId });

    if (error) {
      console.error('Like error:', error);
      return NextResponse.json({ message: 'Failed to like post' }, { status: 500 });
    }

    // Update denormalized like_count
    await supabaseAdmin
      .from('posts')
      .update({ like_count: (post.like_count || 0) + 1 })
      .eq('id', postId);

    return NextResponse.json({ message: 'Post liked successfully' }, { status: 201 });

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (!existing) {
      return NextResponse.json({ message: 'Not liked this post' }, { status: 404 });
    }

    await supabaseAdmin
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    // Update denormalized like_count
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single();

    await supabaseAdmin
      .from('posts')
      .update({ like_count: Math.max(0, (post?.like_count || 1) - 1) })
      .eq('id', postId);

    return NextResponse.json({ message: 'Post unliked successfully' });

  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
