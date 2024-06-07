const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

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
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'You have already rated this book !' });
            } else {
                book.ratings.push(updatedRating);
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length;
                return book.save();
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
};

//// Update //////////////////////////////////////////////
// MODIFY ONE BOOK
exports.modifyBook = async (req, res, next) => {
    let book;
    let oldImg;

    try {
        // Check if there's a downloaded image, otherwise we set the object
        const bookObject = req.file
        ? { ...JSON.parse(req.body.book) }
        : { ...req.body };
        delete bookObject._userId;

        // Find book by id
        book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ message: 'Error, book not found !' });
        }

        // Check if user has created the book
        if (book.userId.toString() !== req.auth.userId) {
            return res.status(403).json({ message: 'Error, unauthorized request !' });
        }

        // Save the previous image
        oldImg = book.imageURL;

        // Checks if entries when updating the book are valid
        const { title, author, genre, year } = bookObject;
        const errors = areTheEntriesValid(title, author, genre, year);
        if (errors.length > 0) { throw new Error(`The following entries are not valid: ${errors.join(", ")}`) };

        // Recover the old image file name
        const oldImgName = book.imageUrl.split('/images/')[1];

        // Check if a file has been downloaded and updates the new URL
        if (req.file) {
            const newImgUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            book.imageUrl = newImgUrl;
        }

        // Updates book data
        await book.updateOne({
            ...bookObject,
            imageUrl: req.file ? book.imageUrl : oldImg
        });

        // If file has been downloaded, remove the old image
        if (req.file) { deleteImage(`images/${oldImgName}`) };

        res.status(200).json({ message: 'The book has been successfully updated !' });

    } catch (error) {
        if (req.file) {
            deleteImage(req.file.path);  // Delete downloaded image 
            try {
                await book.updateOne({ imageUrl: oldImg }) // Recover old image
            } catch (error) {
                console.error('Error 400: Unable restore the image on server !', error);
            }
        }
        res.status(400).json({ error: error.message });
    }
};

//// Delete //////////////////////////////////////////////
exports.deleteBook = (req, res, next) => {
    const bookId = req.params.id;
    Book.findOne({ _id: bookId })
        .then((book) => {
            if (!book) {
                res.status(404).json({
                    message: "Livre non trouvé.",
                });
            } else if (book.userId.toString() !== req.auth.userId) {
                res.status(403).json({
                    message: "Unauthorized request !",
                });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                Book.deleteOne({ _id: bookId })
                    .then(() => {
                        deleteImage(`images/${filename}`);
                        res.status(200).json({
                            message: "The book has been successfully deleted",
                        });
                    })
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

// UTILITIES ////////////
/**
 * Delete images in DB
 * @param {URI} imagePath 
 */
const deleteImage = (imagePath) => {
    try {
        fs.unlinkSync(imagePath);
    } catch (error) {
        console.error("Error deleting image !", error);
    }
};

/**
 * Checks if inputs during the creation of a Book are valid
 * @param {String} title 
 * @param {String} author 
 * @param {String} genre 
 * @param {Number} year 
 * @returns 
 */
const areTheEntriesValid = (title, author, genre, year) => {
    const inputsErrorMessage = [];

    const titleInput = /^[a-zA-Z\0-9\sÀ-ÿ,:!?¿$¥€£+\-'&"]{3,50}$/;
    const textInput  = /^[a-zA-Z\sÀ-ÿ\-]{3,50}$/;
    const yearInput  = /^\d{4}$/;

    if (title && !titleInput.test(title)) {
        inputsErrorMessage.push('Title format is invalid !');
    }

    if (author && !textInput.test(author)) {
        inputsErrorMessage.push('Author format is invalid !');
    }

    if (year && !yearInput.test(year)) {
        inputsErrorMessage.push('Year format must be YYYY !');
    }

    if (genre && !textInput.test(genre)) {
        inputsErrorMessage.push('Genre format is invalid !');
    }

    return inputsErrorMessage;
};