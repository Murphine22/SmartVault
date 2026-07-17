import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Share2, Trash2, Settings, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Documents', icon: <FileText size={20} />, path: '/documents' },
    { label: 'Shared', icon: <Share2 size={20} />, path: '/shared' },
    { label: 'Trash', icon: <Trash2 size={20} />, path: '/trash' },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: 100
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }} className="text-gradient">SmartVault</h2>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '8px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--glass-bg)' : 'transparent',
              border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? 600 : 400
            })}
          >
            <span style={{ color: 'inherit' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 24px', marginTop: 'auto' }}>
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage Used</p>
          <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }} />
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '8px', fontWeight: 500 }}>45% of 50GB</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
