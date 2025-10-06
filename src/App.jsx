import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="loading"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Routes>
            <Route 
              path="/login" 
              element={
                !user ? (
                  <Login onLogin={login} loading={loading} />
                ) : (
                  <Navigate to="/chat" replace />
                )
              } 
            />
            <Route 
              path="/chat" 
              element={
                user ? (
                  <Chat user={user} onLogout={logout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                <Navigate to={user ? "/chat" : "/login"} replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
