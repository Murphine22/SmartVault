import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import SharedDocuments from './pages/SharedDocuments';
import UploadDocument from './pages/UploadDocument';
import MyDocuments from './pages/MyDocuments';
import FolderExplorer from './pages/FolderExplorer';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const App = () => {
  const { user, loading } = useAuth();
  const bypassAuth = true;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-blue)', fontSize: '1.2rem', animation: 'pulse-glow 1.5s infinite' }}>Loading SmartVault...</div>
      </div>
    );
  }

  const effectiveUser = bypassAuth ? { name: 'Demo User' } : user;

  return (
    <div className="app-container">
      {effectiveUser && <Sidebar />}
      <div className="main-content" style={{ marginLeft: effectiveUser ? 'var(--sidebar-width)' : '0' }}>
        {effectiveUser && <Header />}
        
        <div style={{ padding: '24px', flex: 1, position: 'relative' }}>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/documents" element={<MyDocuments />} />
            <Route path="/shared" element={<SharedDocuments />} />
            <Route path="/upload" element={<UploadDocument />} />
            <Route path="/folders" element={<FolderExplorer />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
