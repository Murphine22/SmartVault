import React, { useState } from 'react';
import { Moon, SunMedium, Bell, ShieldCheck } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('smartvault-theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('smartvault-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Control appearance, notifications, and privacy preferences.</p>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Theme</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Switch between dark and light experiences.</p>
          </div>
          <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Moon size={16} /> : <SunMedium size={16} />} {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Notifications</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Stay informed when files are shared or edited.</p>
          </div>
          <button className="btn btn-secondary"><Bell size={16} /> Enable</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Security</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Keep your workspace protected with role-aware permissions.</p>
          </div>
          <button className="btn btn-secondary"><ShieldCheck size={16} /> Protected</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
