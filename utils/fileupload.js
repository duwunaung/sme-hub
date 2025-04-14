require('dotenv').config();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = [".jpeg", ".jpg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype) || !allowedExts.includes(ext)) {
      return cb(new Error("Invalid file type! Only JPEG and PNG are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: process.env.RECEIPT_FILESIZE * 1024 * 1024 }
});

const handleUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, function(err) {
      if (err) {
        req.fileError = err.message;
        return next();
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleUpload
};