const multer = require("multer");
const path = require('path');

const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'storage/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = formattedDate + '-' + Math.round(Math.random() * 1E9);
        cb(null, "certificate" + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

module.exports = upload;