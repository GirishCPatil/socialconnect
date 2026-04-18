// ============================================
// SocialConnect - Type Definitions
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  location: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  image_url: string;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author?: User;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface ApiError {
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
