var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({extended: true}));

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', {error: err});
}

// Connection URL
var url = 'mongodb://localhost:27017/movies';

MongoClient.connect(url, function (err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    app.get('/', function (req, res) {
        db.collection('movies').find({}).toArray(function (err, docs) {
            res.render('movies', {'movies': docs});
        });
    });

    app.post('/movie', function (req, res, next) {
        var movie = {
            title: req.body.title,
            year: req.body.year,
            imdb: req.body.imdb
        };

        db.collection('movies').insertOne(movie, function (err, docs) {

            db.collection('movies').find({}).toArray(function (err, docs) {
                res.render('movies', {'movies': docs});
            });
        });
    });

    app.use(errorHandler);

    var server = app.listen(3000, function () {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });
});

