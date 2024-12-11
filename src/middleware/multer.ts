import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000000000000000000000000 },
});

// Export the upload instance
export default upload;