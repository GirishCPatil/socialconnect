// ============================================
// POST /api/auth/logout - User Logout
// ============================================

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // JWT is stateless — client removes token from localStorage
    // This endpoint exists for API completeness
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
