const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary ID
  format: { type: String, required: true }, // pdf, png, docx, etc.
  size: { type: Number, required: true }, // bytes
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['read', 'edit'], default: 'read' }
  }],
  category: { type: String, default: 'Uncategorized' },
  tags: [{ type: String }],
  accessLevel: { type: String, enum: ['private', 'public', 'shared'], default: 'private' },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Create text index for search
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
