import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import sampleDocuments from '../data/sampleDocuments';
import { UploadCloud, Plus, FileText, Search } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, statRes] = await Promise.all([
          api.get('/documents'),
          api.get('/analytics/dashboard')
        ]);
        const serverDocs = Array.isArray(docRes?.data?.data) ? docRes.data.data : [];
        const seededDocs = serverDocs.length > 0 ? serverDocs : sampleDocuments;
        setDocuments(seededDocs);
        setStats(statRes?.data?.data || { totalFiles: seededDocs.length });
      } catch (error) {
        console.error('Error fetching data', error);
        setDocuments(sampleDocuments);
        setStats({ totalFiles: sampleDocuments.length });
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

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDoc = {
      _id: `local-${Date.now()}`,
      title: file.name,
      category: 'Uploaded',
      format: file.name.split('.').pop()?.toLowerCase() || 'pdf',
      size: file.size,
      createdAt: new Date().toISOString(),
      tags: ['uploaded', 'new'],
      fileUrl: '#',
    };

    setDocuments([newDoc, ...documents]);
    setStats((prev) => prev ? { ...prev, totalFiles: (prev.totalFiles || 0) + 1 } : { totalFiles: 1 });
  };

  const allTags = ['all', ...new Set(documents.flatMap((doc) => doc.tags || []))];
  const tagCount = new Set(documents.flatMap((doc) => doc.tags || [])).size;
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = `${doc.title} ${doc.category} ${(doc.tags || []).join(' ')}`.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'all' || (doc.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="glass-panel hero-panel" style={{ padding: '24px 24px 28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="flex-between" style={{ gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '620px' }}>
            <div className="chip">✨ AI-ready workspace</div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome back to your vibrant vault</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>Organize, discover, and collaborate on documents with a calmer, faster, and more delightful experience.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="chip">⚡ Fast search</span>
              <span className="chip">🗂 Smart tagging</span>
              <span className="chip">🔒 Secure sharing</span>
            </div>
          </div>
          <label className="btn btn-primary" style={{ cursor: 'pointer', minWidth: '190px' }}>
            <Plus size={18} /> Upload Document
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={20} color="var(--accent-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', lineHeight: 1 }}>{stats?.totalFiles || documents.length}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Files</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--accent-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', lineHeight: 1 }}>{tagCount}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Tags</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={20} color="var(--accent-pink)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', lineHeight: 1 }}>{filteredDocs.length}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visible Results</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents or tags"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}
            />
          </div>
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag === 'all' ? 'All tags' : tag}</option>
            ))}
          </select>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Documents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {filteredDocs.map(doc => (
          <DocumentCard 
            key={doc._id} 
            document={doc} 
            onDelete={handleDelete}
            onDownload={(doc) => window.open(doc.fileUrl, '_blank')}
            onShare={() => alert('Sharing modal triggered')}
          />
        ))}
        
        {filteredDocs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No documents found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try another search or tag filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
