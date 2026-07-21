export const createShareUrl = (document, origin = window.location.origin) => {
  if (document?.fileUrl && typeof document.fileUrl === 'string' && document.fileUrl.startsWith('http')) {
    return document.fileUrl;
  }

  return `${origin}/dashboard?doc=${encodeURIComponent(document?._id || 'shared-document')}`;
};

export const createFallbackDownloadContent = (document) => {
  const title = document?.title || 'document';
  const category = document?.category || 'Uncategorized';
  const size = document?.size || 0;
  const createdAt = document?.createdAt ? new Date(document.createdAt).toLocaleString() : 'Unknown';

  return [
    `Title: ${title}`,
    `Category: ${category}`,
    `Size: ${size}`,
    `Created: ${createdAt}`,
    '',
    'Downloaded from SmartVault.',
  ].join('\n');
};

export const createSafeFileName = (document) => {
  const base = (document?.title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'document';
  return `${base}.txt`;
};
