import React, { useEffect, useMemo, useState } from 'react';
import { FolderTree, Files, ChevronRight } from 'lucide-react';
import api from '../services/api';

const FolderExplorer = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const { data } = await api.get('/documents');
        setDocuments(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to load folder structure', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const groupedDocuments = useMemo(() => {
    return documents.reduce((acc, document) => {
      const category = document.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(document);
      return acc;
    }, {});
  }, [documents]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Folder explorer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Browse your categorized files and jump into the right workspace quickly.</p>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <FolderTree size={18} color="var(--accent-purple)" />
          <h3>Document tree</h3>
        </div>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading folders…</div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {Object.entries(groupedDocuments).map(([category, docs]) => (
              <div key={category} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Files size={16} color="var(--accent-blue)" />
                  <strong>{category}</strong>
                </div>
                <div style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {docs.map((doc) => (
                    <span key={doc._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ChevronRight size={14} />{doc.title}</span>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedDocuments).length === 0 && (
              <div style={{ color: 'var(--text-secondary)' }}>No categorized files yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderExplorer;
