const multer = require('multer');
const sharp = require('sharp');

// MIME types list
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png"
};

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    // File configuration
    filename : (req, file, callback) => {
        const name = file.originalname.split(' ').join('_')
        const pattern = (/\.png|\.jpeg|\.jpg/).exec(name)
        const newName = name.replace(pattern[0], "")
        callback(null, Date.now() + newName + '.webp')
    }
})

// Allowed files filter
const fileFilter = (req, file, callback) => {
    const isValid = MIME_TYPES[file.mimetype];
    if (isValid) {
        callback(null, true);
    } else {
        callback(new Error("Unsupported file type !"), false);
    }
};

// IMG storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024
    },
    fileFilter: fileFilter
}).single('image');

// IMG resizing
const compressIMG = (req, res, next) => {
    if (!req.file) { return next(); }

    const filePath = req.file.path;

    sharp(filePath)
        .resize({ fit: "cover", height: 643, width: 500 })
        .webp({ quality: 85 })
        .toBuffer()
        .then((data) => {
            sharp(data)
                .toFile(filePath)
                .then(() => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
};  

// IMG upload
const uploadIMG = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message:
                        "The file size is too large (4 MB maximum) !",
                });
            } else if (err.message === "Unsupported file type !") {
                return res.status(400).json({ message: err.message });
            } else {
                return res.status(400).json({ message: err.message });
            }
        }

        next();
    });
};

module.exports = {
    uploadIMG,
    compressIMG
};
