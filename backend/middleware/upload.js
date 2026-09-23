const multer = require('multer');
const path = require('path');
const fs = require('fs');

const TEMP_DIR = path.join(__dirname, '../temp_uploads');

// Ensure temporary upload directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `temp_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common image formats AND audio formats (for voice messages)
  const allowedMime = /^(image\/(jpeg|png|webp|gif|svg\+xml|avif|jpg)|audio\/(webm|ogg|mp4|wav|mpeg|aac|x-m4a))$/i;
  if (allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) and audio files (WebM, OGG, MP4, WAV) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

module.exports = upload;
