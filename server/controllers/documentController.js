const mongoose = require('mongoose');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const cloudinary = require('../config/cloudinary');
const documentStore = require('../utils/documentStore');

const isDatabaseReady = () => mongoose.connection.readyState === 1 && !!mongoose.connection.db;

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, category, tags, accessLevel } = req.body;
    
    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'smartvault' },
      async (error, result) => {
        if (error) {
          const fallbackDoc = await documentStore.createDocument({
            title: title || req.file.originalname,
            description,
            fileUrl: `https://placehold.co/600x400?text=${encodeURIComponent(title || req.file.originalname)}`,
            publicId: `local-${Date.now()}`,
            format: req.file.originalname.split('.').pop() || 'file',
            size: req.file.size,
            owner: req.user._id,
            category,
            tags: tags ? tags.split(',') : [],
            accessLevel,
          });
          return res.status(201).json({ success: true, data: fallbackDoc, message: 'Stored as a local fallback document because cloud storage is unavailable' });
        }
        
        let doc;
        if (isDatabaseReady()) {
          try {
            doc = await Document.create({
              title: title || req.file.originalname,
              description,
              fileUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format || req.file.originalname.split('.').pop(),
              size: result.bytes,
              owner: req.user._id,
              category,
              tags: tags ? tags.split(',') : [],
              accessLevel,
            });
            await Activity.create({ user: req.user._id, action: 'upload', document: doc._id });
          } catch (error) {
            console.warn('MongoDB document create failed, using fallback store:', error.message);
            doc = await documentStore.createDocument({
              title: title || req.file.originalname,
              description,
              fileUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format || req.file.originalname.split('.').pop(),
              size: result.bytes,
              owner: req.user._id,
              category,
              tags: tags ? tags.split(',') : [],
              accessLevel,
            });
          }
        } else {
          doc = await documentStore.createDocument({
            title: title || req.file.originalname,
            description,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format || req.file.originalname.split('.').pop(),
            size: result.bytes,
            owner: req.user._id,
            category,
            tags: tags ? tags.split(',') : [],
            accessLevel,
          });
        }

        res.status(201).json({ success: true, data: doc });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { category, search, isArchived } = req.query;
    let query = { 
      $or: [
        { owner: req.user._id },
        { accessLevel: 'public' },
        { 'sharedWith.user': req.user._id }
      ]
    };

    if (isArchived) query.isArchived = isArchived === 'true';
    else query.isArchived = false;

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    let documents;
    if (isDatabaseReady()) {
      try {
        documents = await Document.find(query).populate('owner', 'name email').sort({ createdAt: -1 });
      } catch (error) {
        console.warn('MongoDB document list failed, using fallback store:', error.message);
        documents = await documentStore.listDocuments({ owner: req.user._id });
      }
    } else {
      documents = await documentStore.listDocuments({ owner: req.user._id });
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
    } else if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
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

    const shouldHardDelete = req.query.hard === 'true' || req.query.mode === 'permanent' || true;

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
    } else {
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
    }

    res.json({ success: true, message: 'Document removed permanently' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
