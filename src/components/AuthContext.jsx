import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  userId: null,
  setUserId: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/check-auth');
        setIsAuthenticated(response.data.isAuthenticated);
        setUserId(response.data.userId); // Adjust according to your API response
      } catch (error) {
        setIsAuthenticated(false);
        setUserId(null);
        console.log("Authentication check error:", error);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;






