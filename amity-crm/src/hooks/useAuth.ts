import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthInfo {
  roleId: number | null;
  userId: number | null;
  isLoggedIn: boolean;
}

interface DecodedToken {
  userId: number;
  roleId: number;
  email: string;
  exp: number;
}

export const useAuth = (): AuthInfo => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    roleId: null,
    userId: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setAuthInfo({
            roleId: decodedToken.roleId,
            userId: decodedToken.userId,
            isLoggedIn: true,
          });
        }
      } catch (error) {
        console.error('Invalid token found:', error);
      }
    }
  }, []);

  return authInfo;
};
