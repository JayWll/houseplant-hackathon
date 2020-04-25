// Initialize project
const db = require('./src/db')
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '../.env')})
const express = require('express');
const app = express();

// Handle requests for the root page by serving the static index.html from the views folder
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Handle requests to /newreading by posting a new reading to the database
app.get('/newreading', (req, res) => {
  // Filter out requests that don't include the secret key, or don't contain the required data
  if (req.query.s != process.env.SECRET || !RegExp('^\\d*$').test(req.query.v)) return res.status(400).send('Bad Request').end();

  db.Readings.create({ timestamp: new Date(), reading: req.query.v });
  res.status(200).send('Reading received: ' + req.query.v).end();
});

// Handle requests for /getdata by returning a JSON object of data for the relevant time period
app.get('/getdata', (req, res) => {
  const iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

  if (!req.query.from || !req.query.to || !RegExp(iso8601).test(req.query.from) || !RegExp(iso8601).test(req.query.to)) {
    res.status(400).send('Bad Request').end();
    return;
  }

  db.Readings.findAll({
    attributes: ['timestamp', 'reading'],
    where: {
      timestamp: {
        [db.Op.between]: [new Date(req.query.from), new Date(req.query.to)]
      }
    },
    order: [
      ['timestamp', 'DESC']
    ]
  }).then((result) => {
    res.status(200).send(result).end();
  })
});

// Handle requests for /exportall by retrieving all data and returning a JSON object
app.get('/exportall', (req, res) => {
  // Check that the expected key has been included with the web request
  if (!req.headers['export-key'] || req.headers['export-key'] != process.env.SECRET) {
    return res.status(401).send('Authorization header not found').end();
  }

  db.Readings.findAll().then((result) => {
    res.status(200).send(result).end();
  })
})

// Handle requests for /showsettings by retrieving all settings from the database and returning a JSON object
app.get('/showsettings', (req, res) => {
  // Check that the expected key has been included with the web request
  if (!req.headers['export-key'] || req.headers['export-key'] != process.env.SECRET) {
    return res.status(401).send('Authorization header not found').end();
  }

  db.Settings.findAll().then((result) => {
    res.status(200).send(result).end();
  })
})

// Handle requests to /cleanup by deleting any data older than 90 days from the datastore
app.get('/cleanup', (req, res) => {
  if (!req.headers['cleanup-key'] || req.headers['cleanup-key'] != process.env.SECRET) {
    return res.status(401).send('Authorization header not found').end();
  }

  var before = new Date();
  before.setDate(before.getDate()-91);
  before.setHours(0);
  before.setMinutes(0);
  before.setSeconds(0);

  db.Readings.destroy({
    where: {
      timestamp: {
        [db.Op.lt]: before
      }
    }
  }).then((numRows) => {
    res.status(200).send('Deleted rows: ' + numRows).end();
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT || 4200, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
