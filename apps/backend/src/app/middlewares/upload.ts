import util from 'util';
import multer from 'multer';
import path from 'path';
const maxSize = 10 * 1024 * 1024; // 10MB

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../../../uploads'), // Directory to save files
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`); // Rename file to avoid conflicts
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            cb(null, true); // Proceed with the upload
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.originalname)); // Multer's custom error handling
        }
    },
}).single('file'); // Adjust 'file' to the name of your input field

// Promisify the middleware for use in async functions
const uploadFileMiddleware = util.promisify(upload);
export default uploadFileMiddleware;
