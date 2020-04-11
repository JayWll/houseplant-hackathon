const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Setup database, using credentials set in .env
const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  dialect: 'sqlite',
  storage: '.data/database.sqlite'
});

// Define 'readings' table structure
const Readings = sequelize.define('readings', {
  timestamp: {
    type: Sequelize.DATE
  },
  reading: {
    type: Sequelize.INTEGER
  }
});

module.exports = {Op, Readings}
