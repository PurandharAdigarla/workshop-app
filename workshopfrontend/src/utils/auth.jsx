/**
 * Authentication Utility Module
 * 
 * This module provides authentication and authorization utilities for the workshop application.
 * It handles JWT token decoding, role verification, authentication status checks, and logout operations.
 * 
 * The functions in this file are critical for implementing role-based access control
 * and ensuring that only authorized users can access specific parts of the application.
 */

/**
 * Decodes a JWT token and extracts its payload
 * 
 * A JWT token consists of three parts: header, payload, and signature, separated by dots.
 * This function extracts and decodes the payload (middle part) which contains user information
 * such as user ID, role, and other claims.
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if token is invalid/missing
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // Split the token and get the payload part (second segment)
    const base64Url = token.split('.')[1];
    
    // Convert base64url to regular base64 by replacing URL-safe chars
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 string and convert to UTF-8 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // Parse JSON string to object
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Gets the user's role from the JWT token stored in localStorage
 * 
 * This function retrieves the access token from localStorage, decodes it,
 * and extracts the role claim. The role is used for determining user permissions
 * and access control throughout the application.
 * 
 * @returns {string|null} User role (e.g., 'ADMIN', 'ATTENDEE') or null if not authenticated
 */
export const getUserRole = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  const decodedToken = decodeToken(token);
  // The optional chaining (?.) ensures we don't get an error if decodedToken is null
  return decodedToken?.role || null;
};

/**
 * Checks if the current user has a specific role
 * 
 * Used for role-based access control in components to determine if a user
 * should have access to certain features or pages. For example, verifying
 * that only ADMIN users can access admin dashboard.
 * 
 * @param {string} role - Role to check (e.g., 'ADMIN', 'ATTENDEE')
 * @returns {boolean} True if user has the specified role, false otherwise
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Checks if the user is authenticated
 * 
 * This function verifies the presence of an access token in localStorage,
 * which indicates that a user is logged in. This is used to conditionally
 * render components or redirect users to the login page when authentication
 * is required.
 * 
 * Note: This only checks for token existence, not validity. For more secure
 * applications, token expiration should also be verified.
 * 
 * @returns {boolean} True if user is authenticated (has a token), false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Logs out the user by clearing all auth data and redirecting to login
 * 
 * This function provides a centralized way to handle logout across the application.
 * It removes all authentication-related data from localStorage and redirects
 * the user to the login page.
 * 
 * @param {Function} navigate - React Router navigate function for redirection
 *                            - If not provided, will use window.location.href instead
 */
export const logout = (navigate) => {
  // Remove all authentication-related data from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('attendeeId');
  localStorage.removeItem('adminId');
  localStorage.removeItem('userRole');
  
  // Redirect to login page
  if (navigate) {
    // Use React Router's navigate function if provided (preferred method)
    navigate('/login');
  } else {
    // Fallback to direct URL change if navigate is not available
    window.location.href = '/login';
  }
}; 