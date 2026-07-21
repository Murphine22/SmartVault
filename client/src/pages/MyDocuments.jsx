import React from 'react';
import { FileText, FolderOpen, Sparkles } from 'lucide-react';

const folders = [
  { name: 'Projects', count: '12 files' },
  { name: 'Legal', count: '7 files' },
  { name: 'Finance', count: '9 files' },
];

const MyDocuments = () => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>My documents</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Structured folders and document collections for everyday work.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {folders.map((folder) => (
          <div key={folder.name} className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <FolderOpen size={20} color="var(--accent-blue)" />
            </div>
            <h3 style={{ marginBottom: '4px' }}>{folder.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{folder.count}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--accent-purple)" />
          <h3>Folder explorer</h3>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {['Contracts', 'Operations', 'Design', 'Board Materials'].map((item) => (
            <div key={item} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={16} color="var(--accent-green)" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
