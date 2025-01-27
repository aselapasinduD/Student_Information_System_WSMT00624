const multer = require("multer");
const path = require('path');

const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const imageFileExtensions = ['.jpg', '.jpeg', '.png'];
        const dataBundleExtensions = ['.csv', '.xlsx', '.xlsb', '.xlsm'];
        const pdfFileUpload = ['.pdf'];

        if (dataBundleExtensions.includes(ext)) {
            cb(null, 'storage/data_bundles');
        } else if (imageFileExtensions.includes(ext)) {
            cb(null, 'storage/images');
        } else if (pdfFileUpload.includes(ext)) {
            cb(null, 'storage/PDFs');
        } else {
            cb(null, 'storage/junkFiles');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = formattedDate + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const imageFileExtensions = ['.jpg', '.jpeg', '.png'];
        const dataBundleExtensions = ['.csv', '.xlsx', '.xlsb', '.xlsm'];
        const pdfFileUpload = ['.pdf'];

        if (dataBundleExtensions.includes(ext)) {
            cb(null, "data-bundle" + "-" + uniqueSuffix + ext);
        } else if (imageFileExtensions.includes(ext)) {
            cb(null, "certificate" + "-" + uniqueSuffix + ext);
        } else if (pdfFileUpload.includes(ext)) {
            cb(null, "pdf-template" + "-" + uniqueSuffix + ext);
        } else {
            cb(null, "junk_files" + "-" + uniqueSuffix + ext);
        }
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
