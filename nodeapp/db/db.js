const Sequelize = require('sequelize')
const Op = Sequelize.Op

// Setup database, using credentials set in .env
const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  dialect: 'sqlite',
  logging: false,
  storage: '.data/database.sqlite'
})

// Define 'readings' table structure
const Readings = sequelize.define('readings', {
  timestamp: {
    type: Sequelize.DATE
  },
  reading: {
    type: Sequelize.INTEGER
  }
})

// Define 'settings' table structure
const Settings = sequelize.define('settings', {
  key: {
    type: Sequelize.STRING,
    unique: true
  },
  value: {
    type: Sequelize.STRING
  }
})

module.exports = {Op, Readings, Settings}
