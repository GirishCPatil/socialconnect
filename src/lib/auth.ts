// ============================================
// SocialConnect - JWT Auth Helpers
// ============================================

// - JWT token in Authorization header
// - bcrypt for password hashing
// - try/catch error handling

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'socialconnect_default_secret_key_32chars'
);

// Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Sign JWT token
export const signToken = async (payload: { userId: string; email: string }): Promise<string> => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
};

// Verify JWT token
export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
};

// Get authenticated user from request
export const getAuthUser = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    // Find user in DB
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) return null;

    return user;
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
};
