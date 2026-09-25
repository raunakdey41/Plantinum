/**
 * Formats Firebase authentication and system errors into clean, user-friendly English messages.
 * Prevents raw technical codes like "Firebase: Error (auth/invalid-credential)." from reaching users.
 */
export function formatError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || String(err);

  // Match known Firebase Auth error codes
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('auth/too-many-requests')) {
    return 'Too many failed login attempts. Please wait a few minutes before trying again.';
  }
  if (msg.includes('auth/network-request-failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (msg.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact customer support.';
  }

  // Clean raw "Firebase: Error (...)" prefix if present
  let cleaned = msg.replace(/^Firebase:\s*Error\s*\(auth\/[^)]+\)\.?\s*/i, '');
  cleaned = cleaned.replace(/^Error:\s*/i, '');
  cleaned = cleaned.trim();

  // If cleaning leaves empty string or raw internal message, provide default
  if (!cleaned || cleaned.startsWith('auth/')) {
    return 'Authentication failed. Please verify your details and try again.';
  }

  return cleaned;
}
