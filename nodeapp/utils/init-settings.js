const db = require('../src/db')
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

db.Settings.sync().then(() => {
  // Remove all previous settings
  db.Settings.destroy({truncate: true})

  // Create settings
  db.Settings.create({ key: 'low-trigger', value: 100 })
  db.Settings.create({ key: 'high-trigger', value: 900 })
  db.Settings.create({ key: 'low', value: false })
  db.Settings.create({ key: 'alert', value: false })
})
