// ============================================
// GET/POST /api/posts/[postId]/comments
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validations';

// List comments for a post
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

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get comments error:', error);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }

    // Get author details
    const authorIds = [...new Set(comments?.map(c => c.author_id) || [])];
    const { data: authors } = await supabaseAdmin
      .from('users')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', authorIds.length > 0 ? authorIds : ['none']);

    const authorMap = new Map(authors?.map(a => [a.id, a]) || []);

    const enrichedComments = comments?.map(comment => ({
      ...comment,
      author: authorMap.get(comment.author_id) || null,
    })) || [];

    return NextResponse.json({ comments: enrichedComments });

  } catch (error) {
    console.error('Comments error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Add comment to a post
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
    const body = await request.json();
    const validated = createCommentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check post exists
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id, comment_count')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        content: validated.data.content,
        author_id: user.id,
        post_id: postId,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create comment error:', error);
      return NextResponse.json({ message: 'Failed to add comment' }, { status: 500 });
    }

    // Update denormalized comment_count
    await supabaseAdmin
      .from('posts')
      .update({ comment_count: (post.comment_count || 0) + 1 })
      .eq('id', postId);

    return NextResponse.json(
      {
        message: 'Comment added successfully',
        comment: {
          ...comment,
          author: { id: user.id, username: user.username, first_name: user.first_name, last_name: user.last_name, avatar_url: user.avatar_url },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
