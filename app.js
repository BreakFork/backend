const express = require('express');

const app = express();

// CORS 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/books', (req, res, next) => {
    const stuff = [
        {
            title: 'Milwaukee Mission',
            imageUrl: 'https://via.placeholder.com/206x260',
        },
        {
            title: 'Book for Esther',
            imageUrl: 'https://via.placeholder.com/206x260',
        },
    ];
    res.status(200).json(stuff);
});

module.exports = app;