const express = require('express');
const mysql = require('mysql');
const moment = require('moment');
const app = express();

const PORT = process.env.PORT || 8082;

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root@localhost:3306/micro';
var connection = mysql.createConnection(DATABASE_URL);

require('./middleware/appMiddleware')(app);

var amqp = require('amqplib');

amqp.connect('amqp://localhost').then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {

    var ok = ch.assertQueue('addMovieToActiveMovies', {durable: false});

    ok = ok.then(function(_qok) {
      return ch.consume('addMovieToActiveMovies', function(data) {
        const expirationDate = moment().add(1, 'd');
        if (typeof data.title === 'undefined') throw new Error('Podaj tytuł!')
        const newData = {
            title: data.title,
            movieId: data.movieId,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            expirationDate: expirationDate.format('YYYY-MM-DD HH:mm:ss')
        };
        const sql = 'INSERT INTO activemovies SET ?';
        var query = connection.query(sql, newData, function (error, results, fields) {
            if (error) throw error;
        });

      }, {noAck: true});
    });

    return ok.then(function(_consumeOk) {
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  });
}).catch(console.warn);

// app.post('/movies/:movieId', (req, res) => {
//     const movieId = req.params.movieId;
//     const expirationDate = moment().add(1, 'd');
//     if (typeof req.body.title === 'undefined') res.status(400).send({status: 400, message: 'Provide title property!'});
//     const newData = {
//         title: req.body.title,
//         movieId: movieId,
//         date: moment().format('YYYY-MM-DD HH:mm:ss'),
//         expirationDate: expirationDate.format('YYYY-MM-DD HH:mm:ss')
//     };

//     const sql = 'INSERT INTO activemovies SET ?';
//     var query = connection.query(sql, newData, function (error, results, fields) {
//         if (error) res.status(400).send(error);
//         res.status(200).json(newData);
//     });
// });

app.get('/movies', (req, res) => {
    const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = connection.query('SELECT * FROM activemovies WHERE expirationDate > ?', dateNow, function (error, results, fields) {
        if (error) res.status(400).send(error);
        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log('App listening on port: ' + PORT);
});
