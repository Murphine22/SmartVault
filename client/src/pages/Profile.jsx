import React, { useEffect, useState } from 'react';
import { UserCircle2, Mail, Shield, CalendarDays, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      });
      if (data.success) {
        const nextUser = { ...(user || {}), ...data.user, email: form.email, name: form.name };
        updateUser(nextUser);
        setMessage('Profile updated successfully.');
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

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
            <h2 style={{ marginBottom: '4px' }}>{user?.name || 'Signed-in user'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'Administrator' : 'Workspace member'}</p>
          </div>
        </div>

        {message && <div style={{ marginBottom: '16px', color: 'var(--accent-green)' }}>{message}</div>}

        <div style={{ display: 'grid', gap: '12px' }}>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password (optional)" />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Mail size={16} /> {user?.email || 'elishaejimofor@gmail.com'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Shield size={16} /> Role: {user?.role || 'user'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><CalendarDays size={16} /> Member since 2026</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
