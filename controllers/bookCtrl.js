const Book = require('../models/Book');

//// CRUD ///////////////////////////////////////////////
//// Create /////////////////////////////////////////////
// CREATE ONE BOOK
exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        ratings: [],
        averageRating : 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    await book.save()
        .then(() => res.status(201).json({ message: 'A new book was created !' }))
        .catch(error => res.status(400).json({ error }))
};


//// Read ///////////////////////////////////////////////
// GET ALL BOOKS
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }))
};

// GET ONE BOOK
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }))
};

// GET TOP RATED BOOKS 
exports.getTopRatedBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then((books) => { res.status(200).json(books) })
        .catch((error) => { res.status(500).json({ 
            message : 'An error has occured !',
            error: error 
            })
        })
};

//// Update //////////////////////////////////////////////
// MODIFY ONE BOOK
exports.modifyBook = (req, res, next) => {

};



//// Delete //////////////////////////////////////////////
// DELETE ONE BOOK
exports.deleteBook = (req, res, next) => {

};