import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Invalid credentials or server error.';
      setError(message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 45%, #fdfdfd 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px',
        borderRadius: '24px',
        background: '#ffffff',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(167,139,250,0.18))', borderRadius: '50%', filter: 'blur(10px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '110px', height: '110px', background: 'linear-gradient(135deg, rgba(34,211,238,0.16), rgba(59,130,246,0.12))', borderRadius: '50%', filter: 'blur(8px)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '58px', height: '58px',
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.24)'
          }}>
            <Shield size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '1.95rem', marginBottom: '8px', color: '#0f172a' }}>Welcome back</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Securely access your document vault</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            color: '#b91c1c',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '18px',
            fontSize: '0.92rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '12px',
                border: '1px solid #dbe4f0',
                fontSize: '0.95rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>Password</label>
              <Link to="/forgot" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '13px 42px 13px 14px',
                  borderRadius: '12px',
                  border: '1px solid #dbe4f0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.97rem',
            fontWeight: 700,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(37, 99, 235, 0.24)'
          }}>
            Sign In <ArrowRight size={18} style={{ marginLeft: '6px', display: 'inline-block' }} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.92rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
