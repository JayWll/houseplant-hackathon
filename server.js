// server.js
// where your node app starts

// init project
var express = require('express');
var Sequelize = require('sequelize');
const Op = Sequelize.Op
var request = require('request');      // TEMPORARY! Used for import function.
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

// Handle requests to post a new reading
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

/*
  const query = datastore
    .createQuery('entry')
    .filter('timestamp', '>=', new Date(req.query.from))
    .filter('timestamp', '<', new Date(req.query.to))
    .order('timestamp', { descending: true });

  datastore.runQuery(query, function(err, ent) {
    res
      .status(200)
      .send(ent)
      .end()
  })

  var fromDate = new Date('2019-12-01T00:00:00.000Z')
  //return res.status(200).send(fromDate).end();
  
  Readings.findAll({
    attributes: ['timestamp', 'reading'],
    where: {
      timestamp: {
        [Op.lte]: fromDate
      }
    },
    order: [
      ['timestamp', 'DESC']
    ]
  }).then((result) => {
    res.status(200).send(result).end();
  })
});*/


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