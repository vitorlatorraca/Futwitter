import bcrypt from 'bcrypt';

/**
 * Password utility class for secure password handling
 * Follows best practices for password hashing and comparison
 */
export class Password {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a plain text password
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hashed password
   */
  static async toHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param storedPassword - Hashed password from database
   * @param suppliedPassword - Plain text password to verify
   * @returns Promise<boolean> - True if passwords match
   */
  static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    return bcrypt.compare(suppliedPassword, storedPassword);
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns { valid: boolean, errors: string[] }
   */
  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    // Optional: Add more strength requirements
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Password must contain at least one uppercase letter');
    // }
    // if (!/[a-z]/.test(password)) {
    //   errors.push('Password must contain at least one lowercase letter');
    // }
    // if (!/[0-9]/.test(password)) {
    //   errors.push('Password must contain at least one number');
    // }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

