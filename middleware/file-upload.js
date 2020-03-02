const multer = require("multer");
const uuid = require("uuid/v1");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};

const fileUpload = multer({
  limits: 500000, //limit in bytes
  storage: multer.diskStorage({
    // save on disk
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    // !! converts to either true or false
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mimetipe!");
    cb(error, isValid);
  }
});

module.exports = fileUpload;
