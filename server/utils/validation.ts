/**
 * Validation utilities with regex patterns and helper functions
 * Centralized validation logic for authentication and user data
 */

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX = {
  /**
   * Email validation pattern
   * Matches standard email format: user@domain.tld
   */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  /**
   * Password pattern - minimum 6 characters
   * Can be extended for stronger requirements
   */
  PASSWORD_MIN: /^.{6,}$/,

  /**
   * Strong password pattern
   * At least 8 chars, 1 uppercase, 1 lowercase, 1 number
   */
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  /**
   * Name validation - only letters, spaces, and common accents
   */
  NAME: /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/,

  /**
   * UUID v4 pattern
   */
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  /**
   * URL pattern for images and videos
   */
  URL: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,

  /**
   * Base64 image pattern
   */
  BASE64_IMAGE: /^data:image\/(jpeg|jpg|png|gif|webp);base64,/,
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!REGEX.EMAIL.test(email.trim())) {
    errors.push('Invalid email format');
  } else if (email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    if (trimmed.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
    if (!REGEX.NAME.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): ValidationResult {
  const errors: string[] = [];

  if (!uuid || typeof uuid !== 'string') {
    errors.push('ID is required');
  } else if (!REGEX.UUID.test(uuid)) {
    errors.push('Invalid ID format');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate URL (for images, videos, etc.)
 */
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    return { valid: true, errors: [] }; // URL is optional
  }

  const isBase64 = REGEX.BASE64_IMAGE.test(url);
  const isHttpUrl = REGEX.URL.test(url);

  if (!isBase64 && !isHttpUrl) {
    errors.push('Invalid URL format');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate registration data
 */
export function validateRegistration(data: {
  name: string;
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];

  const nameResult = validateName(data.name);
  const emailResult = validateEmail(data.email);
  const passwordResult = validatePassword(data.password);

  errors.push(...nameResult.errors);
  errors.push(...emailResult.errors);
  errors.push(...passwordResult.errors);

  return { valid: errors.length === 0, errors };
}

/**
 * Validate login data
 */
export function validateLogin(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];

  const emailResult = validateEmail(data.email);
  const passwordResult = validatePassword(data.password);

  errors.push(...emailResult.errors);
  errors.push(...passwordResult.errors);

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize string input - remove potentially harmful characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email - lowercase and trim
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

