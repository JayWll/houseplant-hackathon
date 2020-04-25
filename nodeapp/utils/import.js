const db = require('../src/db')
const request = require('request')
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

// The URL from which to export production data
const readingsurl = 'https://jasonsplant.glitch.me/exportall'
const settingsurl = 'https://jasonsplant.glitch.me/showsettings'

// Get readings from the production server
request({
  url: readingsurl,
  headers: {
    'export-key': process.env.SECRET
  },
  json: true
}, async(error, response) => {
  if (error) return console.log(error)
  if (response.statusCode != 200) return console.log('Unsuccessful, as indicated by HTTP status')

  console.log(response.body.length + ' readings retrieved')

  // Remove existing database items
  await db.Readings.destroy({truncate: true})

  // Add new data to the database
  await db.Readings.bulkCreate(response.body)
});

// Get settings from the production server
request({
  url: settingsurl,
  headers: {
    'export-key': process.env.SECRET
  },
  json: true
}, async(error, response) => {
  if (error) return console.log(error)
  if (response.statusCode != 200) return console.log('Unsuccessful, as indicated by HTTP status')

  console.log(response.body.length + ' settings retrieved')

  // Remove existing database items
  await db.Settings.destroy({truncate: true})

  // Add new data to the database
  await db.Settings.bulkCreate(response.body)
});
