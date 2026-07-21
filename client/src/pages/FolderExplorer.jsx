import React from 'react';
import { FolderTree, Files, ChevronRight } from 'lucide-react';

const tree = [
  { name: 'Root', children: ['Projects', 'Finance', 'Operations'] },
  { name: 'Projects', children: ['Launch', 'Roadmap', 'Contracts'] },
  { name: 'Finance', children: ['Budgets', 'Forecasts'] },
];

const FolderExplorer = () => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Folder explorer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Browse folders and move through your document tree with ease.</p>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <FolderTree size={18} color="var(--accent-purple)" />
          <h3>Document tree</h3>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          {tree.map((item) => (
            <div key={item.name} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Files size={16} color="var(--accent-blue)" />
                <strong>{item.name}</strong>
              </div>
              <div style={{ paddingLeft: '22px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {item.children.map((child) => (
                  <span key={child} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ChevronRight size={14} />{child}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FolderExplorer;
