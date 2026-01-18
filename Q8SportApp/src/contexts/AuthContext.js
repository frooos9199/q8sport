import React, { createContext, useState, useContext, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { AuthService } from '../services/api/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('🔍 AuthContext: Loading user from storage...');
      const savedToken = await StorageService.getToken();
      const savedUser = await StorageService.getUser();
      
      console.log('📦 AuthContext: Retrieved from storage:', {
        hasToken: !!savedToken,
        hasUser: !!savedUser,
        userName: savedUser?.name,
        tokenPreview: savedToken ? `${savedToken.substring(0, 30)}...` : 'null'
      });
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: User authenticated successfully');
      } else {
        console.log('⚠️ AuthContext: No saved credentials found');
      }
    } catch (error) {
      console.error('❌ AuthContext: Error loading user:', error);
    } finally {
      setLoading(false);
      console.log('🏁 AuthContext: Loading complete');
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login for:', email);
      const response = await AuthService.login(email, password);
      
      console.log('📥 AuthContext: Login response:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userName: response.user?.name
      });
      
      if (response.token && response.user) {
        await StorageService.saveToken(response.token);
        await StorageService.saveUser(response.user);
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: Login successful and saved');
        return { success: true };
      }
      
      console.log('⚠️ AuthContext: Login failed - missing token or user');
      return { success: false, error: 'فشل تسجيل الدخول' };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'حدث خطأ في تسجيل الدخول' 
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await AuthService.register(name, email, password, phone);
      
      if (response.user) {
        // Auto login after register
        const loginResult = await login(email, password);
        return loginResult;
      }
      
      return { success: false, error: 'فشل التسجيل' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'حدث خطأ في التسجيل' 
      };
    }
  };

  const logout = async () => {
    try {
      await StorageService.clearAll();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'حدث خطأ في تسجيل الخروج' };
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const newUser = { ...user, ...updatedUser };
      await StorageService.saveUser(newUser);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'حدث خطأ في تحديث المستخدم' };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
