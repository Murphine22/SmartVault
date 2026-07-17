const multer = require('multer');

// Store files in memory temporarily
const storage = multer.memoryStorage();

// File filter (optional, currently allowing everything but restricting size via multer options)
const fileFilter = (req, file, cb) => {
  // You can restrict file types here if needed
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit per file
  },
  fileFilter
});

module.exports = upload;
