const db = require('../db/db')
const request = require('request')
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

// The URL from which to export production data
const url = 'https://jasonsplant.glitch.me/exportall'

// Get data from the production server
request({
  url,
  headers: {
    'export-key': process.env.SECRET
  },
  json: true
}, (error, {body}) => {
  if (error) return console.log(error)

  console.log(body.length + ' items retrieved')

  // Remove existing database items
  db.Readings.destroy({truncate: true})

  // Add new data to the database
  db.Readings.bulkCreate(body)
});
