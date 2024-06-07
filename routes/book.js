const express = require('express');
const auth = require('../middleware/auth');
const { uploadIMG, compressIMG } = require('../middleware/multer-config');
const bookCtrl = require('../controllers/bookCtrl');
const router = express.Router();

router.get('/bestrating', bookCtrl.getTopRatedBooks);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);

router.post('/', auth, uploadIMG, compressIMG, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.rating);

router.put('/:id', auth, uploadIMG, compressIMG, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;