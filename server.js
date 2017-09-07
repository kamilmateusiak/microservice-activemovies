const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const app = express();

const PORT = process.env.PORT || 8082;

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root@localhost:3306/micro';
var connection = mysql.createConnection(DATABASE_URL);

require('./middleware/appMiddleware')(app);

app.post('/movies/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const expirationDate = moment().add(1, 'd');
    const newData = {
        title: req.body.title,
        movieId: movieId,
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        expirationDate: expirationDate.format('YYYY-MM-DD HH:mm:ss')
    };

    const sql = 'INSERT INTO activemovies SET ?';
    var query = connection.query(sql, newData, function (error, results, fields) {
        if (error) res.status(400).send(error);
        res.status(200).json(newData);
    });
});

app.get('/movies', (req, res) => {
    const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = connection.query('SELECT * FROM activemovies WHERE expirationDate > ?', dateNow, function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log('App listening on port: ' + PORT);
});
