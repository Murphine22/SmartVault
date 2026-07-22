const mongoose = require('mongoose');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const cloudinary = require('../config/cloudinary');
const documentStore = require('../utils/documentStore');

const isDatabaseReady = () => mongoose.connection.readyState === 1 && !!mongoose.connection.db;

const persistDocumentRecord = async ({ userId, title, description, fileUrl, publicId, format, size, category, tags, accessLevel }) => {
  const normalizedTags = Array.isArray(tags)
    ? tags
    : (tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : []);

  const payload = {
    title: title || 'Untitled document',
    description,
    fileUrl,
    publicId,
    format: format || 'file',
    size,
    owner: userId,
    category,
    tags: normalizedTags,
    accessLevel,
  };

  if (isDatabaseReady()) {
    try {
      const doc = await Document.create(payload);
      await Activity.create({ user: userId, action: 'upload', document: doc._id });
      return { doc, usedFallback: false };
    } catch (error) {
      console.warn('MongoDB document create failed, using fallback store:', error.message);
    }
  }

  const fallbackDoc = await documentStore.createDocument(payload);
  return { doc: fallbackDoc, usedFallback: true };
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, category, tags, accessLevel } = req.body;
    
    const shouldAttemptCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'test' && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'test' && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'test';

    if (!shouldAttemptCloudinary) {
      const result = await persistDocumentRecord({
        userId: req.user._id,
        title: title || req.file.originalname,
        description,
        fileUrl: `https://placehold.co/600x400?text=${encodeURIComponent(title || req.file.originalname)}`,
        publicId: `local-${Date.now()}`,
        format: req.file.originalname.split('.').pop() || 'file',
        size: req.file.size,
        category,
        tags,
        accessLevel,
      });
      return res.status(201).json({ success: true, data: result.doc, message: 'Stored locally because Cloudinary is not configured for this environment.' });
    }

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'smartvault' },
      async (error, result) => {
        if (error) {
          const result = await persistDocumentRecord({
            userId: req.user._id,
            title: title || req.file.originalname,
            description,
            fileUrl: `https://placehold.co/600x400?text=${encodeURIComponent(title || req.file.originalname)}`,
            publicId: `local-${Date.now()}`,
            format: req.file.originalname.split('.').pop() || 'file',
            size: req.file.size,
            category,
            tags,
            accessLevel,
          });
          return res.status(201).json({ success: true, data: result.doc, message: 'Stored as a local fallback document because cloud storage is unavailable' });
        }

        const storedResult = await persistDocumentRecord({
          userId: req.user._id,
          title: title || req.file.originalname,
          description,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format || req.file.originalname.split('.').pop(),
          size: result.bytes,
          category,
          tags,
          accessLevel,
        });

        res.status(201).json({ success: true, data: storedResult.doc });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { category, search, isArchived, view = 'active' } = req.query;
    let query = {
      $or: [
        { owner: req.user._id },
        { accessLevel: 'public' },
        { 'sharedWith.user': req.user._id }
      ]
    };

    const archivedFlag = isArchived ?? (view === 'trash' ? 'true' : 'false');
    query.isArchived = archivedFlag === 'true';

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    let documents = [];
    const fallbackDocuments = await documentStore.listDocuments({ owner: req.user._id });

    if (isDatabaseReady()) {
      try {
        documents = await Document.find(query).populate('owner', 'name email').sort({ createdAt: -1 });
      } catch (error) {
        console.warn('MongoDB document list failed, using fallback store:', error.message);
        documents = fallbackDocuments;
      }
    } else {
      documents = fallbackDocuments;
    }

    if (fallbackDocuments.length) {
      const seenIds = new Set(documents.map((doc) => String(doc._id)));
      const mergedFallback = fallbackDocuments.filter((doc) => !seenIds.has(String(doc._id)));
      documents = [...documents, ...mergedFallback];
    }

    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    let doc;
    let fallbackDoc;
    if (isDatabaseReady()) {
      try {
        doc = await Document.findById(req.params.id);
      } catch (error) {
        console.warn('MongoDB document lookup failed, using fallback store:', error.message);
      }
    }

    if (!doc) {
      fallbackDoc = (await documentStore.listDocuments({ owner: req.user._id })).find((item) => item._id === req.params.id);
      if (!fallbackDoc) return res.status(404).json({ success: false, message: 'Document not found' });
      if (fallbackDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
    } else {
      const isOwner = doc.owner.toString() === req.user._id.toString();
      const hasEditAccess = doc.sharedWith?.some((item) => item.user?.toString() === req.user._id.toString() && item.permission === 'edit');
      if (!isOwner && !hasEditAccess) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
    }

    let updatedDoc;
    if (isDatabaseReady()) {
      try {
        updatedDoc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await Activity.create({ user: req.user._id, action: 'edit', document: doc._id });
      } catch (error) {
        console.warn('MongoDB document update failed, using fallback store:', error.message);
        updatedDoc = await documentStore.updateDocument(req.params.id, req.body);
      }
    } else {
      updatedDoc = await documentStore.updateDocument(req.params.id, req.body);
    }

    res.json({ success: true, data: updatedDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.shareDocument = async (req, res) => {
  try {
    const { userId, permission = 'read' } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'A user ID is required' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Only the owner can share a document' });
    }

    const existingShare = doc.sharedWith?.find((entry) => entry.user?.toString() === userId);
    if (existingShare) {
      existingShare.permission = permission;
    } else {
      doc.sharedWith.push({ user: userId, permission });
    }

    await doc.save();
    await Activity.create({ user: req.user._id, action: 'share', document: doc._id, details: `Shared with ${userId}` });

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    let doc;
    if (isDatabaseReady()) {
      try {
        doc = await Document.findById(req.params.id);
      } catch (error) {
        console.warn('MongoDB document lookup failed, using fallback store:', error.message);
      }
    }

    if (!doc) {
      const fallbackDoc = (await documentStore.listDocuments({ owner: req.user._id })).find((item) => item._id === req.params.id);
      if (!fallbackDoc) return res.status(404).json({ success: false, message: 'Document not found' });
      if (fallbackDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
    } else if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const shouldHardDelete = req.query.hard === 'true' || req.query.mode === 'permanent';

    if (shouldHardDelete) {
      if (isDatabaseReady()) {
        try {
          if (doc?.publicId) {
            await cloudinary.uploader.destroy(doc.publicId);
          }
          await Document.findByIdAndDelete(req.params.id);
          await Activity.create({ user: req.user._id, action: 'delete', details: `Hard deleted ${doc?.title || req.params.id}` });
        } catch (error) {
          console.warn('MongoDB hard delete failed, using fallback store:', error.message);
          await documentStore.deleteDocument(req.params.id);
        }
      } else {
        await documentStore.deleteDocument(req.params.id);
      }
      return res.json({ success: true, message: 'Document deleted permanently' });
    }

    if (isDatabaseReady()) {
      try {
        doc.isArchived = true;
        await doc.save();
        await Activity.create({ user: req.user._id, action: 'delete', document: doc._id, details: 'Moved to trash' });
      } catch (error) {
        console.warn('MongoDB soft delete failed, using fallback store:', error.message);
        await documentStore.updateDocument(req.params.id, { isArchived: true });
      }
    } else {
      await documentStore.updateDocument(req.params.id, { isArchived: true });
    }

    res.json({ success: true, message: 'Document moved to trash' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreDocument = async (req, res) => {
  try {
    let doc;
    if (isDatabaseReady()) {
      try {
        doc = await Document.findById(req.params.id);
      } catch (error) {
        console.warn('MongoDB document lookup failed, using fallback store:', error.message);
      }
    }

    if (!doc) {
      const fallbackDoc = (await documentStore.listDocuments({ owner: req.user._id })).find((item) => item._id === req.params.id);
      if (!fallbackDoc) return res.status(404).json({ success: false, message: 'Document not found' });
      if (fallbackDoc.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      doc = fallbackDoc;
    } else if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (isDatabaseReady()) {
      try {
        doc.isArchived = false;
        await doc.save();
        await Activity.create({ user: req.user._id, action: 'restore', document: doc._id, details: 'Restored from trash' });
      } catch (error) {
        console.warn('MongoDB restore failed, using fallback store:', error.message);
        await documentStore.updateDocument(req.params.id, { isArchived: false });
      }
    } else {
      await documentStore.updateDocument(req.params.id, { isArchived: false });
    }

    res.json({ success: true, message: 'Document restored' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
