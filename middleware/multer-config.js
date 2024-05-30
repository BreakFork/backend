const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename : (req, file, callback) => {
        const name = file.originalname.split(' ').join('_')
        const pattern = (/\.png|\.jpeg|\.jpg/).exec(name)
        const newName = name.replace(pattern[0], "")
        callback(null, newName + Date.now() + '.webp')
    }
})

module.exports = multer({ storage: storage }).single('image');
