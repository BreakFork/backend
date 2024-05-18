const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: ".env" });

// Routes declaration
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

const app = express();

// CORS 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
    credentials: true
}));

mongoose.connect(process.env.DB_URI)
        .then(() => console.log('MongoDB connection succed !'))
        .catch(() => console.log('MongoDB connection failed !'))

app.use(express.json()); // Permet de récupérer le corps de la req en JSON

// Routes URL
app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;