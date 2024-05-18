const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/bookCtrl');
const router = express.Router();

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/bestrating', bookCtrl.getTopRatedBooks);

router.post('/', auth, multer, bookCtrl.createBook);

module.exports = router;