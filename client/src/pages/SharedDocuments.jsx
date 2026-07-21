import React from 'react';
import { Share2, Sparkles } from 'lucide-react';

const sharedDocs = [
  { title: 'Partner onboarding', owner: 'Operations', permission: 'Can edit' },
  { title: 'Release brief', owner: 'Engineering', permission: 'Can view' },
  { title: 'Marketing launch deck', owner: 'Marketing', permission: 'Can comment' },
];

const SharedDocuments = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', marginBottom: '8px' }}>Shared documents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Collaborate with teams and keep everyone aligned.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {sharedDocs.map((doc) => (
          <div key={doc.title} className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={18} color="var(--accent-green)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.97rem' }}>{doc.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc.owner}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
              <Sparkles size={14} />
              <span style={{ fontSize: '0.8rem' }}>{doc.permission}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedDocuments;
