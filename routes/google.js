'use strict';

// const config = require('config');
// const pino = require('pino');
// const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

var express = require('express')
var router = express.Router()

// GET /push/gcm 
router.get('/', function (req, res) {
  res.status(400).send('Firebase Cloud Messaging handler is available for POST at /push/gcm/send')
})
// GET /push/gcm/send 
router.get('/send', function (req, res) {
  res.status(405).send('Sorry you need to POST a JSON')
})
// POST /push/gcm/send only gets JSON bodies
// https://github.com/firebase/quickstart-js/blob/master/messaging/README.md
router.post('/send', express.json(), function (req, res) {
  console.log(JSON.stringify(req.body, null, 2))
  res.send('Sorry FCM not implemented yet!')
})

module.exports = router
