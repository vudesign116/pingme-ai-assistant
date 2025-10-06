import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';
import './Login.css';

const Login = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Vui lòng nhập mã nhân viên';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clear previous messages
    setErrors({});
    setWarningMessage('');

    const result = await onLogin(formData.employeeId, formData.password);
    
    if (!result.success) {
      setErrors({ general: result.message });
    } else if (result.warning) {
      setWarningMessage(result.warning);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId.trim()) {
      setErrors({ employeeId: 'Vui lòng nhập mã nhân viên để reset mật khẩu' });
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    // Mock reset password API call
    setTimeout(() => {
      setResetLoading(false);
      setResetMessage('Đã gửi link reset mật khẩu đến email của bạn');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage('');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="login-container">
      <ConnectionStatus />
      
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="25" fill="#007AFF"/>
              <path d="M20 30L25 35L40 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="logo-text">PingMe</h1>
          <p className="logo-subtitle">AI Assistant Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}
          
          {warningMessage && (
            <div className="warning-message">
              <AlertCircle size={16} />
              <span>{warningMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="employeeId" className="form-label">
              Mã nhân viên
            </label>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`form-input ${errors.employeeId ? 'error' : ''}`}
                placeholder="Nhập mã nhân viên"
                autoComplete="username"
              />
            </div>
            {errors.employeeId && (
              <span className="field-error">{errors.employeeId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading"></div>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost forgot-password-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            Quên mật khẩu?
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-credentials">
          <p className="demo-title">� Tài khoản demo:</p>
          <p className="demo-subtitle">
            Webhook authentication tạm thời bị vô hiệu hóa
          </p>
          <div className="demo-accounts-grid">
            <div className="demo-account-card">
              <div className="demo-account-name">Trần Thiện Toàn</div>
              <div className="demo-account">
                <strong>MR2593</strong> / abc123
              </div>
            </div>
            <div className="demo-account-card">
              <div className="demo-account-name">Phạm Nhật Vinh</div>
              <div className="demo-account">
                <strong>MR1674</strong> / abc123  
              </div>
            </div>
          </div>
          <div className="demo-note">
            <small>💡 Sử dụng một trong hai tài khoản trên để đăng nhập</small>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Quên mật khẩu</h3>
            <p>Nhập mã nhân viên để nhận link reset mật khẩu:</p>
            
            {resetMessage && (
              <div className="success-message">
                {resetMessage}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="form-input"
                  placeholder="Mã nhân viên"
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={resetLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <div className="loading"></div>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;