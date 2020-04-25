const Sequelize = require('sequelize')
const Op = Sequelize.Op
const path = require('path')
const twit = require('twit')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

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
        // Reset low moisture flag if it's set, and the reading is greater than high-trigger
        if (result.find(o => o.dataValues.key === 'low').dataValues.value !== '0' && data.reading >= parseInt(result.find(o => o.dataValues.key === 'high-trigger').dataValues.value)) {
          // Pick a random message from the array below
          const tweet = [
            'Thanks to whoever watered me just now!! So moist.',
            'So refreshing! Thank you, mysterious stranger, for the life-giving liquidy sustenance.',
            'Whoever watered me (I\'m kind of guessing it was you, @Katheryn_mur), know that I appreciate it!'
          ]

          // Define options for the twitter API
          const msg = new twit({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token: process.env.ACCESS_TOKEN,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET
          })

          msg.post('statuses/update', { status: tweet[Math.floor(Math.random() * tweet.length)] })

          // Update low to false
          db.Settings.update({ value: false }, { where: { key: 'low' } })
          // Update alert to false
          db.Settings.update({ value: false }, { where: { key: 'alert' } })
        }

        // Set the low moisture flag if it's not set, and the value is less than low-trigger
        if (result.find(o => o.dataValues.key === 'low').dataValues.value === '0' && data.reading <= parseInt(result.find(o => o.dataValues.key === 'low-trigger').dataValues.value)) {
          // Update low to true
          db.Settings.update({ value: new Date().toISOString() }, { where: { key: 'low' } })
        }

        // If the low moisture flag is set but an alert has not yet been sent, determine if an alert is necessarry
        if (result.find(o => o.dataValues.key === 'low').dataValues.value !== '0' && result.find(o => o.dataValues.key === 'alert').dataValues.value === '0') {
          const lowtriggered = new Date().getTime() - new Date(result.find(o => o.dataValues.key === 'low').dataValues.value).getTime()
          const fourdays = 4 * 24 * 60 * 60 * 1000

          // If the first low reading was more than 5 days ago, send an alert
          if (lowtriggered > fourdays) {
            // Pick a random message from the array below
            const tweet = [
              'I\'m getting pretty thirsty over here, @JayWll',
              'So. Very. Dry. You know I\'m a succulent not a cactus, right @JayWll? 🌵',
              'Hey @JayWll, water me. 🥛',
              'They say a man shall not live by bread alone, and a succulent won\'t live if you don\'t WATER ME @JAYWLL!!1! 🍞🚰💦',
              '@JayWll seriously bro. A little water. That\'s all I ask.'
            ]

            // Define options for the twitter API
            const msg = new twit({
              consumer_key: process.env.CONSUMER_KEY,
              consumer_secret: process.env.CONSUMER_SECRET,
              access_token: process.env.ACCESS_TOKEN,
              access_token_secret: process.env.ACCESS_TOKEN_SECRET
            })

            // Post a tweet
            msg.post('statuses/update', { status: tweet[Math.floor(Math.random() * tweet.length)] })

            // Flag that an alert has been sent
            db.Settings.update({ value: new Date().toISOString() }, { where: { key: 'alert' } })
          } else console.log('Low for less than 5 days')
        } else console.log('No message needed')
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
