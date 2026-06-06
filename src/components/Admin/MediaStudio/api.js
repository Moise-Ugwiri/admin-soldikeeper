/** Shared API base for Media Studio — REACT_APP_API_URL already includes /api */
export const getApiUrl = () =>
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};