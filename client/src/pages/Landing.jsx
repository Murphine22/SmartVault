import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 60px', background: 'radial-gradient(circle at top left, rgba(59,130,246,0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(139,92,246,0.16), transparent 28%), var(--bg-primary)' }}>
      <div className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', borderRadius: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', marginBottom: '16px' }}>
              <Sparkles size={16} />
              Next generation document intelligence
            </div>
            <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '16px' }}>A premium workspace for secure documents, rich collaboration, and calm control.</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>SmartVault blends advanced document workflows, modern sharing, role-based governance, and a beautifully responsive UI into one compelling experience.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary">Launch demo <ArrowRight size={18} /></Link>
              <Link to="/register" className="btn btn-secondary">Create account</Link>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: ShieldCheck, title: 'Secure by default', text: 'Private, shared, and public modes with role-aware permissions.' },
                { icon: Zap, title: 'Fast workflows', text: 'Upload, organize, search, and collaborate in seconds.' },
                { icon: Layers, title: 'Scale-ready', text: 'Built to expand from solo use to multi-team operations.' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color="var(--accent-blue)" />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
