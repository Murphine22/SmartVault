import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, HardDriveUpload, FolderSymlink, Cloud, Loader2 } from 'lucide-react';
import api from '../services/api';

const sources = [
  { id: 'local', label: 'Local device', description: 'Upload from your computer', icon: HardDriveUpload },
  { id: 'google', label: 'Google Drive', description: 'Connect and import from Drive', icon: Cloud },
  { id: 'dropbox', label: 'Dropbox', description: 'Import files from Dropbox', icon: FolderSymlink },
];

const categoryOptions = [
  'Uncategorized',
  'Finance',
  'Operations',
  'Compliance',
  'HR',
  'Engineering',
  'Marketing',
  'Sales',
  'Legal',
  'Design',
  'Strategy',
  'Executive',
  'Support',
];

const UploadDocument = () => {
  const [uploaded, setUploaded] = useState(false);
  const [selectedSource, setSelectedSource] = useState('local');
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));
    formData.append('description', `Uploaded from ${selectedSource === 'local' ? 'local device' : selectedSource === 'google' ? 'Google Drive' : 'Dropbox'}`);
    formData.append('category', category);
    formData.append('tags', category.toLowerCase());

    setFileName(file.name);
    setIsUploading(true);
    setUploaded(false);
    setMessage('');
    setUploadError('');

    try {
      const response = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedDoc = response?.data?.data;
      if (uploadedDoc) {
        setUploaded(true);
        setMessage(`${file.name} was uploaded and placed in ${category}.`);
      } else {
        setMessage('Upload complete.');
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message || 'Upload failed. Please try again.';
      setUploadError(backendMessage);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Upload document</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose how you want to bring files into your vault and assign a category.</p>
      <div className="glass-panel" style={{ padding: '24px', maxWidth: '780px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          {sources.map((source) => {
            const Icon = source.icon;
            const active = selectedSource === source.id;
            return (
              <button
                key={source.id}
                className="btn"
                onClick={() => setSelectedSource(source.id)}
                style={{ justifyContent: 'flex-start', padding: '14px', border: active ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)', background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}
              >
                <Icon size={18} />
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginLeft: '8px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{source.label}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{source.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Document category
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
          <UploadCloud size={36} color="var(--accent-blue)" style={{ marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '8px' }}>{selectedSource === 'local' ? 'Drop files from your device' : `Import from ${selectedSource === 'google' ? 'Google Drive' : 'Dropbox'}`}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Supports PDFs, images, docs, spreadsheets, and more.</p>
          <label className={`btn btn-primary ${isUploading ? 'disabled' : ''}`} style={{ cursor: isUploading ? 'wait' : 'pointer' }}>
            {isUploading ? <><Loader2 size={16} className="spin" /> Uploading...</> : 'Choose file'}
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={isUploading} />
          </label>
        </div>

        {message && (
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {uploadError && (
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', color: 'var(--accent-red)' }}>
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
