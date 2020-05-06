const path = require('path')
const twit = require('twit')
require('dotenv').config({path: path.join(__dirname, '../../.env')})

const alert = (type) => {
  var tweet = false

  switch(type) {
    // Water is needed
    case 'wantwater':
      tweet = [
        'I\'m getting pretty thirsty over here, @JayWll',
        'So. Very. Dry. You know I\'m a succulent not a cactus, right @JayWll? 🌵',
        'Hey @JayWll, water me. 🥛',
        'They say a man shall not live by bread alone, and a succulent won\'t live if you don\'t WATER ME @JAYWLL!!1! 🍞🚰💦',
        '@JayWll seriously bro. A little water. That\'s all I ask.'
      ]
      break

    // Water has been received
    case 'gotwater':
      tweet = [
        'Thanks to whoever watered me just now!! So moist.',
        'So refreshing! Thank you, mysterious stranger, for the life-giving liquidy sustenance.',
        'Whoever watered me (I\'m kind of guessing it was you, @Katheryn_mur), know that I appreciate it!'
      ]
      break
  }

  if (!tweet) {
    console.log('nothing to send')
    return
  }

  // Define options for the twitter API
  const msg = new twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  })

  // Post tweet
  msg.post('statuses/update', { status: tweet[Math.floor(Math.random() * tweet.length)] })
}

module.exports = alert
