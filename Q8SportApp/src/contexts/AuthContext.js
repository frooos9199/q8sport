import React, { createContext, useState, useContext, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { AuthService } from '../services/api/auth';
import { AuthEvents } from '../services/authEvents';
import Logger from '../utils/logger';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();

    const unsubscribe = AuthEvents.onUnauthorized(() => {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    });

    return unsubscribe;
  }, []);

  const loadUser = async () => {
    try {
      // تحسين: قراءة متوازية للبيانات
      const [savedToken, savedUser] = await Promise.all([
        StorageService.getToken(),
        StorageService.getUser()
      ]);
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error loading user:', error);
    } finally {
      setLoading(false);
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

  const register = async (name, email, password, phone, whatsapp, acceptedTerms = false) => {
    try {
      Logger.auth('Register attempt', { acceptedTerms });
      const normalizedPhone = phone?.trim() || null;
      const normalizedWhatsapp = whatsapp?.trim() || null;
      const response = await AuthService.register(name, email, password, normalizedPhone, normalizedWhatsapp, acceptedTerms);
      
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

  const updateProfile = async (data) => {
    try {
      const response = await AuthService.updateProfile(data);

      if (response?.token && response?.user) {
        await StorageService.saveToken(response.token);
        await StorageService.saveUser(response.user);
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }

      console.log('⚠️ AuthContext: Update response missing token/user:', response);
      return { success: false, error: response?.error || 'فشل تحديث الملف الشخصي' };
    } catch (error) {
      console.error('❌ AuthContext: Update profile error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message ||
                          error?.message ||
                          'حدث خطأ أثناء تحديث الملف الشخصي';
      
      return {
        success: false,
        error: errorMessage,
      };
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
    updateProfile,
    setUser, // ✅ Export setUser to allow manual refresh
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
