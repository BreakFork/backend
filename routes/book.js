const express = require('express');
const auth = require('../middleware/auth');
const bookCtrl = require('../controllers/book');
const router = express.Router();

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/bestrating', bookCtrl.getTopRatedBooks);

module.exports = router;