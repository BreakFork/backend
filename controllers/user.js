const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

exports.signup = (req, res, next) => {
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: 'Invalid email format !' }) 
    }

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'A new User has been created !' }))
            .catch(error => res.status(400).json({ error }))
    })
    .catch(error => res.status(500).json({error}))
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if(user === null) {
            res.status(400).json({ message: 'The identifiers are incorrect !' })
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(400).json({ message: 'The identifiers are incorrect !' })
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.SECRET_KEY,
                            { expiresIn: '24h' }
                        )
                    });
                }
            })
            .catch(error => {
                res.status(500).json({ error })
            });
        }
    })
    .catch(error => {
        res.status(500).json({ error })
    });
};