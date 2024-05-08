const express = require('express');

const app = express();

app.use((req, res) => {
    res.json({ message: 'Ceci provient du serveur Express !!!'})
});


module.exports = app;