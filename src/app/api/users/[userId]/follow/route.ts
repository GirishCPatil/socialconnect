// ============================================
// POST/DELETE /api/users/[userId]/follow
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

// Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    if (user.id === userId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if target user exists
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const { data: existing } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already following this user' }, { status: 409 });
    }

    // Create follow
    const { error } = await supabaseAdmin
      .from('follows')
      .insert({ follower_id: user.id, following_id: userId });

    if (error) {
      console.error('Follow error:', error);
      return NextResponse.json({ message: 'Failed to follow user' }, { status: 500 });
    }

    // Update counts
    await supabaseAdmin.rpc('increment_field', { table_name: 'users', field_name: 'following_count', row_id: user.id });
    await supabaseAdmin.rpc('increment_field', { table_name: 'users', field_name: 'followers_count', row_id: userId });

    // Fallback: manual update if RPC doesn't exist
    await supabaseAdmin
      .from('users')
      .update({ following_count: (user.following_count || 0) + 1 })
      .eq('id', user.id);

    const { data: targetData } = await supabaseAdmin.from('users').select('followers_count').eq('id', userId).single();
    await supabaseAdmin
      .from('users')
      .update({ followers_count: (targetData?.followers_count || 0) + 1 })
      .eq('id', userId);

    return NextResponse.json({ message: 'Followed successfully' }, { status: 201 });

  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const { data: existing } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ message: 'Not following this user' }, { status: 404 });
    }

    await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    // Update counts
    await supabaseAdmin
      .from('users')
      .update({ following_count: Math.max(0, (user.following_count || 1) - 1) })
      .eq('id', user.id);

    const { data: targetData } = await supabaseAdmin.from('users').select('followers_count').eq('id', userId).single();
    await supabaseAdmin
      .from('users')
      .update({ followers_count: Math.max(0, (targetData?.followers_count || 1) - 1) })
      .eq('id', userId);

    return NextResponse.json({ message: 'Unfollowed successfully' });

  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
