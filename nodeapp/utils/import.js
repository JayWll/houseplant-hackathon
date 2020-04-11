const Sequelize = require('sequelize')
const Op = Sequelize.Op
const request = require('request')
const path = require('path')
const dotenv = require('dotenv').config({path: path.join(__dirname, '../../.env')})

// Database settings
const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  dialect: 'sqlite',
  storage: '.data/database.sqlite'
})

sequelize.authenticate().then((err) => {
  console.log('Connection has been established successfully')

  // Define 'readings' table structure
  Readings = sequelize.define('readings', {
    timestamp: {
      type: Sequelize.DATE
    },
    reading: {
      type: Sequelize.INTEGER
    }
  })

  // Read data
  Readings.sync()
}).catch((err) => {
  console.log('Unable to connect to the database: ', err)
})

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
  Readings.destroy({truncate: true})

  // Add new data to the database
  Readings.bulkCreate(body)
});
