const express = require('express');
const mongoose = require('mongoose');

// Routes declaration
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://HRVB0t0:qupseg-Fobca2-jytfyr@clustertestoc.l6odgrz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTestOC',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
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


module.exports = app;