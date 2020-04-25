const path = require('path')
const twit = require('twit')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

const alert = (type) => {
  console.log('Alert triggered for type: ' + type)
}

module.exports = alert
