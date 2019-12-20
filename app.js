// Initialize project
const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
//const request = require('request');      // TEMPORARY! Used for import function.
const app = express();

// Setup database, using credentials set in .env
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

// Authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');

    // Define 'readings' table structure
    Readings = sequelize.define('readings', {
      timestamp: {
        type: Sequelize.DATE
      },
      reading: {
        type: Sequelize.INTEGER
      }
    });
  
    // Read data
    Readings.sync();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// Handle requests for the root page by serving the static index.html from the views folder
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Handle requests to /newreading by posting a new reading to the database
app.get('/newreading', (req, res) => {
  // Filter out requests that don't include the secret key, or don't contain the required data
  if (req.query.s != process.env.SECRET || !RegExp('^\\d*$').test(req.query.v)) return res.status(400).send('Bad Request').end();
  
  Readings.create({ timestamp: new Date(), reading: req.query.v });
  res.status(200).send('Reading received: ' + req.query.v).end();
});

// Handle requests for /getdata by returning a JSON object of data for the relevant time period
app.get('/getdata', (req, res) => {
  const iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

  if (!req.query.from || !req.query.to || !RegExp(iso8601).test(req.query.from) || !RegExp(iso8601).test(req.query.to)) {
    res.status(400).send('Bad Request').end();
    return;
  }
  
  Readings.findAll({
    attributes: ['timestamp', 'reading'],
    where: {
      timestamp: {
        [Op.between]: [new Date(req.query.from), new Date(req.query.to)]
      }
    },
    order: [
      ['timestamp', 'DESC']
    ]
  }).then((result) => {
    res.status(200).send(result).end();
  })
});

// Handle requests to /cleanup by deleting any data older than 90 days from the datastore
app.get('/cleanup', (req, res) => {
  //if (!req.headers['cleanup-key'] || req.headers['cleanup-key'] != process.env.SECRET) {
  //  return res.status(401).send('Authorization header not found').end();
  //}
  
  var before = new Date();
  before.setDate(before.getDate()-91);
  before.setHours(0);
  before.setMinutes(0);
  before.setSeconds(0);
  
  Readings.destroy({
    where: {
      timestamp: {
        [Op.lt]: before
      }
    }
  }).then((numRows) => {
    res.status(200).send('Deleted rows: ' + numRows).end();
  });
});

/*
app.get('/import', (req, res) => {
  request({ url: 'https://www.jasonsplant.ml/extract', json: true }, (error, {body}) => {
    if (error) return;
    else {
      var arr=[];
      body.forEach((item) => {
        Readings.create({ timestamp: new Date(item.timestamp), reading: item.reading });
      })
      
      res.status(200).send('OK').end();
    }
  })
})

app.get("/data", function (request, response) {
  var result = [];
  Readings.findAll().then(function(reading) { // find all entries in the users tables
    reading.forEach(function(reading) {
      result.push([reading.timestamp, reading.reading]); // adds their info to the dbUsers value
    });
    response.send(result); // sends dbUsers back to the page
  });
});

app.get('/reset', (req, res) => {
  Readings.sync({ force: true });
  res.status(200).send('OK').end();
})
*/

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});