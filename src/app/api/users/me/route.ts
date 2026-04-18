// ============================================
// GET/PUT/PATCH /api/users/me - Own Profile
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';

// Get own profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Update own profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ ...validated.data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at, updated_at')
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PATCH also updates profile
export async function PATCH(request: NextRequest) {
  return PUT(request);
}
