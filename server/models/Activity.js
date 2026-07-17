const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['upload', 'download', 'edit', 'delete', 'share', 'restore'], required: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
