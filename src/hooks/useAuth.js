import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (employeeId, password) => {
    setLoading(true);
    try {
      const result = await authService.login(employeeId, password);
      if (result.success) {
        setUser(result.data);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: 'Có lỗi xảy ra. Vui lòng thử lại.'
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if webhook fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (employeeId) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword(employeeId);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: 'Có lỗi xảy ra. Vui lòng thử lại.'
      };
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user
  };
};