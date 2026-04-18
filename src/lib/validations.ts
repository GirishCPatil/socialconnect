// ============================================
// SocialConnect - Zod Validation Schemas
// ============================================

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
});

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(280, 'Post must be 280 characters or less'),
  image_url: z.string().url().optional().or(z.literal('')),
});

export const updatePostSchema = z.object({
  content: z.string()
    .min(1, 'Post content is required')
    .max(280, 'Post must be 280 characters or less')
    .optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Comment is required')
    .max(280, 'Comment must be 280 characters or less'),
});
