import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import { UploadCloud, Plus, FileText } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, statRes] = await Promise.all([
          api.get('/documents'),
          api.get('/analytics/dashboard')
        ]);
        setDocuments(docRes.data.data);
        setStats(statRes.data.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>My Vault</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and organize your documents securely.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UploadCloud size={28} color="var(--accent-blue)" />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', lineHeight: 1 }}>{stats?.totalFiles || 0}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Files</p>
          </div>
        </div>
        
        {/* We can add more stat cards here */}
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Documents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {documents.map(doc => (
          <DocumentCard 
            key={doc._id} 
            document={doc} 
            onDelete={handleDelete}
            onDownload={(doc) => window.open(doc.fileUrl, '_blank')}
            onShare={() => alert('Sharing modal triggered')}
          />
        ))}
        
        {documents.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No documents found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Upload your first document to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
