const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Routes declaration
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

const app = express();

mongoose.connect(process.env.DB_URI)
        .then(() => console.log('MongoDB connection succed !'))
        .catch(() => console.log('MongoDB connection failed !'))

app.use(express.json()); // Permet de récuopérer le corps de la req en JSON

// CORS 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Routes URL
app.use('/api/auth/', userRoutes);
app.use(('/api/book', bookRoutes))

module.exports = app;