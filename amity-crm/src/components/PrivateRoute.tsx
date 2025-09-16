import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  // Add other token properties if needed
}

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    // Check if token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

const PrivateRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
