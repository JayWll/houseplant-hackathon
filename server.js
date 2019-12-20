// server.js
// where your node app starts

// init project
var express = require('express');
var Sequelize = require('sequelize');
var request = require('request');
var app = express();

// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
  storage: '.data/database.sqlite'
});
var Readings;

// authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'readings'
    Readings = sequelize.define('readings', {
      timestamp: {
        type: Sequelize.DATE
      },
      reading: {
        type: Sequelize.INTEGER
      }
    });
  
    Readings.sync();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/data", function (request, response) {
  var result = [];
  Readings.findAll().then(function(reading) { // find all entries in the users tables
    reading.forEach(function(reading) {
      result.push([reading.timestamp, reading.reading]); // adds their info to the dbUsers value
    });
    response.send(result); // sends dbUsers back to the page
  });
});

// Handle requests to post a new reading
app.get('/newreading', (req, res) => {
  // Filter out requests that don't include the secret key, or don't contain the required data
  if (req.query.s != process.env.SECRET || !RegExp('^\\d*$').test(req.query.v)) return res.status(400).send('Bad Request').end();
  
  Readings.create({ timestamp: new Date(), reading: req.query.v });
  res.status(200).send('Reading received: ' + req.query.v).end();
});

app.get('/import', (req, res) => {
  request({ url: 'https://www.jasonsplant.ml/extract', json: true }, (error, {body}) => {
    if (error) return;
    else {      
      body.foreach((item) => {
        console.log(item)
      })
      
      res.status(200).send(body).end();
    }
  })
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});