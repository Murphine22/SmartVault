import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [invitedMessage, setInvitedMessage] = useState('');
  const { register } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('invite');
    if (tokenFromUrl) {
      setInviteToken(tokenFromUrl);
      setInvitedMessage('Your invitation has been detected. Complete your onboarding below.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, inviteToken || undefined);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to register. Email might be in use.';
      setError(message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, #1a1a2e, #0A0A0A 60%)',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '100px', height: '100px', background: 'var(--accent-purple)', filter: 'blur(60px)', opacity: 0.5 }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join SmartVault to secure your files</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)', padding: '12px', borderRadius: '8px',
            marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {invitedMessage && (
          <div style={{
            background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)',
            color: '#1d4ed8', padding: '12px', borderRadius: '8px',
            marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center'
          }}>
            {invitedMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <UserIcon size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' }}>
            Sign Up <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
