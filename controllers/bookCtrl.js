const Book = require('../models/Book');
const fs = require('fs');

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
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    book.save()
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
        .then(book => res.status(200).json(book))
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

// RATE A BOOK
exports.rating = (req, res, next) => {
    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };

    if (newRating.grade < 0 || newRating.grade > 5) {
        return res.status(400).json({ message: 'Rating must be between 0 and 5' })
    };

    Book.findOne({ _id: req.params.id })
        .then((book) => { 
            if (!book) { 
                throw new Error('No books found !');
            } else if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'You have already rated this book !' });
            } else {
                book.ratings.push(newRating);
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + newRating.grade) / book.ratings.lenght;
                return book.save();
            }
        })
        .then((update) => res.status(201).json(update))
        .catch(error => res.status(400).json({ error }))
};

//// Update //////////////////////////////////////////////
// MODIFY ONE BOOK
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(403).json({ message: 'Unauthorized request !' })
        } else {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => {
                res.status(200).json({ message: 'Book updated !' })
                const eraseOldFile = book.imageUrl.split('/images')[1]
                req.file && fs.unlink(`images/${eraseOldFile}`, (error => {
                    if (error) console.log(error)
                }))
            })
            .catch(error => res.status(401).json({ error }))
        }
    })
    .catch(error => res.status(401).json({ error }))
};

//// Delete //////////////////////////////////////////////
// DELETE ONE BOOK
exports.deleteBook = (req, res, next) => {
    const bookId = req.params.id;
    Book.findOne({ _id: bookId })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({
                    message: 'Unauthorized request !'
                })
            } else {
                Book.deleteOne({ _id: bookId })
                    .then(() => {
                        const filename = book.imageUrl.split('/images/')[1]
                        fs.unlink(`images/${filename}`, (error => { if (error) console.log(error) }))
                        res.status(200).json({ message: 'The book has been successfully deleted' })
                    })
                    .catch((error) => res.status(401).json({ error }))
            }
        })
        .catch((error) => res.status(500).json({ error }))
};