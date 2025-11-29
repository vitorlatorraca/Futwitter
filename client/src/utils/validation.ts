/**
 * Frontend validation utilities
 * Mirrors backend validation for consistent user experience
 */

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX = {
  /**
   * Email validation pattern
   */
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  /**
   * Password pattern - minimum 6 characters
   */
  PASSWORD_MIN: /^.{6,}$/,

  /**
   * Strong password pattern
   * At least 8 chars, 1 uppercase, 1 lowercase, 1 number
   */
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  /**
   * Name validation - letters, spaces, and accents
   */
  NAME: /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/,

  /**
   * URL pattern
   */
  URL: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim();
  
  if (!REGEX.EMAIL.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  
  return { valid: true };
}

/**
 * Validate password strength (optional stricter validation)
 */
export function validatePasswordStrength(password: string): ValidationResult {
  const basicResult = validatePassword(password);
  if (!basicResult.valid) {
    return basicResult;
  }
  
  if (!REGEX.PASSWORD_STRONG.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number' 
    };
  }
  
  return { valid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }
  
  if (!REGEX.NAME.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Validate URL (optional field)
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: true }; // URL is optional
  }
  
  if (!REGEX.URL.test(url)) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  return { valid: true };
}

/**
 * Validate registration form
 */
export function validateRegistrationForm(data: {
  name: string;
  email: string;
  password: string;
}): ValidationResult {
  const nameResult = validateName(data.name);
  if (!nameResult.valid) {
    return nameResult;
  }
  
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    return emailResult;
  }
  
  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    return passwordResult;
  }
  
  return { valid: true };
}

/**
 * Validate login form
 */
export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationResult {
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    return emailResult;
  }
  
  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    return passwordResult;
  }
  
  return { valid: true };
}

/**
 * Format validation errors for display
 */
export function formatValidationError(error: string): string {
  // Could add i18n here in the future
  return error;
}

