// ============================================
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Only JPEG and PNG formats are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `${user.id}/${Date.now()}.${ext}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('socialconnect')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ message: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('socialconnect')
      .getPublicUrl(filename);

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: urlData.publicUrl,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
