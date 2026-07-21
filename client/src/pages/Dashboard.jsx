import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import DocumentCard from '../components/DocumentCard';
import sampleDocuments from '../data/sampleDocuments';
import { createFallbackDownloadContent, createSafeFileName, createShareUrl } from '../utils/documentActions';
import { UploadCloud, Plus, FileText, Search } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Remove this document from your vault?');
    if (!confirmed) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
      setStats((prev) => prev ? { ...prev, totalFiles: Math.max(0, (prev.totalFiles || 0) - 1) } : { totalFiles: 0 });
    } catch (error) {
      console.error(error);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
      setStats((prev) => prev ? { ...prev, totalFiles: Math.max(0, (prev.totalFiles || 0) - 1) } : { totalFiles: 0 });
    }
  };

  const handleDownload = (document) => {
    const fileUrl = document?.fileUrl;

    if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = document?.title || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const blob = new Blob([createFallbackDownloadContent(document)], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = createSafeFileName(document);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const handleShare = async (document) => {
    const shareUrl = createShareUrl(document);

    if (navigator.share) {
      try {
        await navigator.share({
          title: document?.title || 'SmartVault document',
          text: `Open ${document?.title || 'this document'} from SmartVault`,
          url: shareUrl,
        });
        return;
      } catch (error) {
        console.warn('Share cancelled', error);
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to your clipboard.');
        return;
      } catch (error) {
        console.warn('Clipboard unavailable', error);
      }
    }

    window.prompt('Copy this link to share the document', shareUrl);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));
    formData.append('description', 'Uploaded from the web app');
    formData.append('category', 'Uploaded');
    formData.append('tags', 'uploaded,new');

    setIsUploading(true);
    setUploadMessage('');
    setUploadError('');

    try {
      const response = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedDoc = response?.data?.data;
      const backendMessage = response?.data?.message;

      if (uploadedDoc) {
        setDocuments((prevDocs) => [uploadedDoc, ...prevDocs]);
        setStats((prev) => prev ? { ...prev, totalFiles: (prev.totalFiles || 0) + 1 } : { totalFiles: 1 });
      }

      await fetchData();
      setUploadMessage(backendMessage || 'Upload complete and synced to the live backend.');
    } catch (error) {
      console.error('Upload failed', error);
      const message = error?.response?.data?.message || 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const allTags = ['all', ...new Set(documents.flatMap((doc) => doc.tags || []))];
  const allCategories = ['all', ...new Set(documents.map((doc) => doc.category || 'Uncategorized'))];
  const tagCount = new Set(documents.flatMap((doc) => doc.tags || [])).size;
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = `${doc.title} ${doc.category} ${(doc.tags || []).join(' ')}`.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'all' || (doc.tags || []).includes(selectedTag);
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesTag && matchesCategory;
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
          <label className={`btn btn-primary ${isUploading ? 'disabled' : ''}`} style={{ cursor: isUploading ? 'wait' : 'pointer', minWidth: '190px', opacity: isUploading ? 0.75 : 1 }}>
            <Plus size={18} /> {isUploading ? 'Uploading...' : 'Upload Document'}
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={isUploading} />
          </label>
        </div>
      </div>

      {(uploadMessage || uploadError) && (
        <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${uploadError ? 'rgba(248, 113, 113, 0.35)' : 'rgba(52, 211, 153, 0.35)'}`, background: uploadError ? 'rgba(248, 113, 113, 0.12)' : 'rgba(52, 211, 153, 0.12)', color: uploadError ? 'var(--accent-red)' : 'var(--accent-green)' }}>
          {uploadError || uploadMessage}
        </div>
      )}

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
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>
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
            onDownload={handleDownload}
            onShare={handleShare}
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
