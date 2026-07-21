import React from 'react';
import { File, FileText, Image as ImageIcon, Download, Share2, Trash2, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const DocumentCard = ({ document, onShare, onDelete, onDownload }) => {
  const getIcon = (format) => {
    switch (format) {
      case 'pdf': return <FileText size={24} color="#EF4444" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <ImageIcon size={24} color="#3B82F6" />;
      default: return <File size={24} color="#10B981" />;
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className="glass-panel"
      style={{
        padding: '20px',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '220px',
        transformOrigin: 'center center',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.04, boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '12px',
          background: 'var(--bg-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {getIcon(document.format)}
        </div>
        <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <MoreVertical size={18} />
        </button>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {document.title}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {formatSize(document.size)} • {new Date(document.createdAt).toLocaleDateString()}
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
          {document.category}
        </span>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <button type="button" className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }} onClick={(event) => { event.stopPropagation(); onDownload(document); }}>
          <Download size={14} />
        </button>
        <button type="button" className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }} onClick={(event) => { event.stopPropagation(); onShare(document); }}>
          <Share2 size={14} />
        </button>
        <button type="button" className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)' }} onClick={(event) => { event.stopPropagation(); onDelete(document._id); }}>
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
