/**
 * Shared TypeScript types
 * Re-export types from schema for frontend use
 */

// Re-export from shared schema
export type {
  User,
  Team,
  Player,
  News,
  Match,
  Journalist,
  Comment,
  NewsInteraction,
  NewsComment,
  Badge,
  UserBadge,
  Transfer,
  InfluencerRequest,
} from '@shared/schema';

// ============================================
// FRONTEND-SPECIFIC TYPES
// ============================================

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: import('@shared/schema').User | null;
}

/**
 * News filter options
 */
export interface NewsFilters {
  teamId?: string;
  contentType?: 'TEXT' | 'VIDEO';
  authorId?: string;
  search?: string;
}

/**
 * News comment with user info (for display)
 */
export interface NewsCommentWithUser {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Language options
 */
export type Language = 'pt' | 'en' | 'es';
