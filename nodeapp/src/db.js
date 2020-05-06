const Sequelize = require('sequelize')
const Op = Sequelize.Op
const message = require('./alert')

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
}, {
  hooks: {
    afterCreate: (data, opts) => {
      // Fetch all settings
      Settings.findAll().then((result) => {
        const lowtrigger = parseInt(result.find(o => o.dataValues.key === 'low-trigger').dataValues.value)
        const hightrigger = parseInt(result.find(o => o.dataValues.key === 'high-trigger').dataValues.value)
        const low = result.find(o => o.dataValues.key === 'low').dataValues.value
        const alert = result.find(o => o.dataValues.key === 'alert').dataValues.value


        // Reset low moisture flag if it's set, and the reading is greater than high-trigger
        if (low !== '0' && data.reading >= hightrigger) {
          // Send alert that water was received
          message('gotwater')

          // Update low to false
          Settings.update({ value: false }, { where: { key: 'low' } })

          // Update alert to false
          Settings.update({ value: false }, { where: { key: 'alert' } })
        }

        // Set the low moisture flag if it's not set, and the value is less than low-trigger
        if (low === '0' && data.reading <= lowtrigger) {
          // Update low to true
          Settings.update({ value: new Date().toISOString() }, { where: { key: 'low' } })
        }

        // If the low moisture flag is set but an alert has not yet been sent, determine if an alert is necessarry
        if (low !== '0' && alert === '0') {
          const lowtriggered = new Date().getTime() - new Date(low).getTime()
          const fourdays = 4 * 24 * 60 * 60 * 1000

          // If the first low reading was more than 4 days ago, send an alert
          if (lowtriggered > fourdays) {
            // Send alert that water is needed
            message('wantwater')

            // Flag that an alert has been sent
            Settings.update({ value: new Date().toISOString() }, { where: { key: 'alert' } })
          }
        }
      })
    }
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
