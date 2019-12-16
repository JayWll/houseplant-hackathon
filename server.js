// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/newreading", function(request, response) {
  var message = {}
  message.text = 'Value received: ' + request.query.v;
  
  var options = {
    host: 'chat.googleapis.com',
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    }
  };

  options.path = '/v1/spaces/AAAAUtfnG10/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=GWdhpd0zwNfelfUXVLtH-tikPRuiOlEGMcYQyePCvqU%3D';
  sendRequest(options, message);
  
  response.status(200).send('GlitchApp Success').end();
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

function sendRequest(opt, msg) {
  var https = require('https');
  var request = https.request(opt, function(response) {
    var responseString = "";

    response.on('data', function(data) {
      responseString += data;
    });

    response.on('end', function() {
      console.log(responseString);
    });
  });

  request.write(JSON.stringify(msg));
  request.end();
}