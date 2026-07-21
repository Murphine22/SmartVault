const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, updateDocument, shareDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

router.route('/:id')
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

router.post('/:id/share', protect, shareDocument);

module.exports = router;
