import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trash2, RotateCcw } from 'lucide-react';

const TrashPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents?view=trash');
      setDocuments(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to load trash', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const restoreDocument = async (id) => {
    try {
      await api.post(`/documents/${id}/restore`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error('Failed to restore document', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Trash</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Only files you deleted are shown here until you restore or permanently remove them.</p>

      {loading ? (
        <div className="glass-panel" style={{ padding: '20px' }}>Loading deleted files...</div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <Trash2 size={36} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Your trash is empty.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {documents.map((doc) => (
            <div key={doc._id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>{doc.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doc.category || 'Uncategorized'}</p>
              </div>
              <button className="btn btn-primary" onClick={() => restoreDocument(doc._id)}>
                <RotateCcw size={16} /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
