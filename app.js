const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: ".env" });

// Routes declaration
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

const app = express();

var whitelist = ['http://localhost:3000', 'http://www.localhost:3000'];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept', 'x-access-token']
};

app.use(cors(corsOptions));

mongoose.connect(process.env.DB_URI)
        .then(() => console.log('MongoDB connection succed !'))
        .catch(() => console.log('MongoDB connection failed !'))

app.use(express.json()); // Permet de récupérer le corps de la req en JSON

// Routes URL
app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;