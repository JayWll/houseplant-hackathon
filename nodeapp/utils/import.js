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
}, async(error, response) => {
  if (error) return console.log(error)
  if (response.statusCode != 200) return console.log('Unsuccessful, as indicated by HTTP status')

  console.log(response.body.length + ' items retrieved')

  // Sync the database table
  await db.Settings.sync()

  // Remove existing database items
  await db.Readings.destroy({truncate: true})

  // Add new data to the database
  await db.Readings.bulkCreate(response.body)
});
