import React from 'react';
import { UserCircle2, Mail, Shield, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Profile</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Personal profile and role details.</p>
      <div className="glass-panel" style={{ padding: '24px', maxWidth: '620px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle2 size={30} color="white" />
          </div>
          <div>
            <h2 style={{ marginBottom: '4px' }}>{user?.name || 'Demo User'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'Administrator' : 'Workspace member'}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Mail size={16} /> {user?.email || 'elishaejimofor@gmail.com'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Shield size={16} /> Role: {user?.role || 'user'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><CalendarDays size={16} /> Member since 2026</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
