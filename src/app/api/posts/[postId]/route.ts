// ============================================
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { updatePostSchema } from '@/lib/validations';

// Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (error || !post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Get author
    const { data: author } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url')
      .eq('id', post.author_id)
      .single();

    // Check if liked
    const { data: likeData } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    return NextResponse.json({
      post: { ...post, author, is_liked: !!likeData },
    });

  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Update own post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const validated = updatePostSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ message: 'Not authorized to edit this post' }, { status: 403 });
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .update({ ...validated.data, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .select('*')
      .single();

    if (error) {
      console.error('Update post error:', error);
      return NextResponse.json({ message: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post updated successfully', post });

  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  return PUT(request, context);
}

// Delete own post (soft delete, same pattern as deleteExpense)
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

    // Check ownership
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ message: 'Not authorized to delete this post' }, { status: 403 });
    }

    // Soft delete
    await supabaseAdmin
      .from('posts')
      .update({ is_active: false })
      .eq('id', postId);

    // Decrement posts_count
    await supabaseAdmin
      .from('users')
      .update({ posts_count: Math.max(0, (user.posts_count || 1) - 1) })
      .eq('id', user.id);

    return NextResponse.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
