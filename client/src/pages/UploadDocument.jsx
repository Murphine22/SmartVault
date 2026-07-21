import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, HardDriveUpload, FolderSymlink, Cloud } from 'lucide-react';

const sources = [
  { id: 'local', label: 'Local device', description: 'Upload from your computer', icon: HardDriveUpload },
  { id: 'google', label: 'Google Drive', description: 'Connect and import from Drive', icon: Cloud },
  { id: 'dropbox', label: 'Dropbox', description: 'Import files from Dropbox', icon: FolderSymlink },
];

const UploadDocument = () => {
  const [uploaded, setUploaded] = useState(false);
  const [selectedSource, setSelectedSource] = useState('local');
  const [fileName, setFileName] = useState('');

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploaded(true);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Upload document</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose how you want to bring files into your vault.</p>
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

        <div style={{ border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
          <UploadCloud size={36} color="var(--accent-blue)" style={{ marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '8px' }}>{selectedSource === 'local' ? 'Drop files from your device' : `Import from ${selectedSource === 'google' ? 'Google Drive' : 'Dropbox'}`}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Supports PDFs, images, docs, spreadsheets, and more.</p>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            Choose file
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {uploaded && (
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            {fileName ? `${fileName} is queued for upload and indexing.` : 'Document queued for upload and indexing.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
