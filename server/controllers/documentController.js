const Document = require('../models/Document');
const Activity = require('../models/Activity');
const cloudinary = require('../config/cloudinary');

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
        if (error) return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        
        const doc = await Document.create({
          title: title || req.file.originalname,
          description,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format || req.file.originalname.split('.').pop(),
          size: result.bytes,
          owner: req.user._id,
          category,
          tags: tags ? tags.split(',') : [],
          accessLevel
        });

        await Activity.create({ user: req.user._id, action: 'upload', document: doc._id });
        
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

    const documents = await Document.find(query).populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    
    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const updatedDoc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await Activity.create({ user: req.user._id, action: 'edit', document: doc._id });
    
    res.json({ success: true, data: updatedDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (req.query.hard === 'true') {
      await cloudinary.uploader.destroy(doc.publicId);
      await Document.findByIdAndDelete(req.params.id);
      await Activity.create({ user: req.user._id, action: 'delete', details: `Hard deleted ${doc.title}` });
    } else {
      doc.isArchived = true;
      await doc.save();
      await Activity.create({ user: req.user._id, action: 'delete', document: doc._id, details: 'Moved to trash' });
    }
    
    res.json({ success: true, message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
