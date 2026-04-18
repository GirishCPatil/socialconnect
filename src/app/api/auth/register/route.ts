import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashPassword, signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, username, password, first_name, last_name } = validated.data;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        username: username.toLowerCase(),
        password_hash,
        first_name,
        last_name,
      })
      .select('id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = await signToken({ userId: newUser.id, email: newUser.email });

    return NextResponse.json(
      { message: 'User created successfully', token, user: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
