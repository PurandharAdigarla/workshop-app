
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

export const getUserRole = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  const decodedToken = decodeToken(token);
  // The optional chaining (?.) ensures we don't get an error if decodedToken is null
  return decodedToken?.role || null;
};

export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

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