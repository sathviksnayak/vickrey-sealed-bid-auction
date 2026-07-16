import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"
    ];

    const documentTypes = [
        "application/pdf"
    ];

    if (
        imageTypes.includes(file.mimetype) ||
        documentTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only images and PDF files are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

export default upload;