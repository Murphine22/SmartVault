import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Share2, Sparkles, Pencil, Eye } from 'lucide-react';

const SharedDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShared = async () => {
      try {
        const response = await api.get('/documents');
        const shared = (response?.data?.data || []).filter((doc) => doc.sharedWith?.length || doc.accessLevel === 'public');
        setDocuments(shared);
      } catch (error) {
        console.error('Failed to load shared documents', error);
      } finally {
        setLoading(false);
      }
    };

    loadShared();
  }, []);

  const sharedSummary = useMemo(() => documents.map((doc) => ({
    ...doc,
    permission: doc.sharedWith?.[0]?.permission || 'read',
  })), [documents]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading shared documents…</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', marginBottom: '8px' }}>Shared documents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Collaborate with teammates and keep everyone aligned.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {sharedSummary.map((doc) => (
          <div key={doc._id} className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={18} color="var(--accent-green)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.97rem' }}>{doc.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc.owner?.name || 'Shared with you'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
              {doc.permission === 'edit' ? <Pencil size={14} /> : <Eye size={14} />}
              <span style={{ fontSize: '0.8rem' }}>{doc.permission === 'edit' ? 'Can edit' : 'Can view'}</span>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={14} style={{ display: 'inline-block', marginRight: '6px' }} />
              {doc.accessLevel === 'public' ? 'Open to signed-in viewers' : 'Shared directly with your account'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedDocuments;
