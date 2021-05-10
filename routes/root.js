'use strict';

var express = require('express')
var router = express.Router()

router.get('/', function (req, res) {
  res.json({ message: 'Hooray! Welcome to Push Notification Gateway!' });
})

router.post('/', function (req, res) {
  res.status(400).send('Sorry, please POST to the appropriate endpoint')
})

router.post('/echo', express.json(), function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})

router.get('/healthcheck', function (req, res) {
  res.send("OK! I'm healthy!")
})

module.exports = router
