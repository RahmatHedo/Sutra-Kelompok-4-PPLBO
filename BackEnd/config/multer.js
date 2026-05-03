const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
   
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); 
    } else {
        cb(new Error('Hanya boleh upload file gambar!'), false); 
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;