// ============================================
// DELETE /api/posts/[postId]/comments/[commentId]
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId, commentId } = await params;

    // Check comment exists and belongs to user
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single();

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    if (comment.author_id !== user.id) {
      return NextResponse.json({ message: 'Not authorized to delete this comment' }, { status: 403 });
    }

    await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', commentId);

    // Update denormalized comment_count
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('comment_count')
      .eq('id', postId)
      .single();

    await supabaseAdmin
      .from('posts')
      .update({ comment_count: Math.max(0, (post?.comment_count || 1) - 1) })
      .eq('id', postId);

    return NextResponse.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
