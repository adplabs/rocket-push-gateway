'use strict';

// Useful links
// https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_token-based_connection_to_apns
// https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
// https://github.com/node-apn/node-apn/blob/master/doc/notification.markdown

const config = require('config');
const apn = require("@parse/node-apn");
const fetch = require('node-fetch');

// these come from default.js, local.js, ${process.env.NODE_ENV}.js or process.env.NODE_CONFIG object
const apnOptions = {
  token: {
    key: config.pushProviders.apple.p8KeyFilePath,
    keyId: config.pushProviders.apple.keyId,
    teamId: config.pushProviders.apple.teamId
  },
  proxy: {
    host: config.proxyHostname,
    port: config.proxyPort
  },
  rejectUnauthorized: config.pushProviders.apple.rejectUnauthorized,
  production: config.pushProviders.apple.apnProduction
};

var apnProvider = new apn.Provider(apnOptions);

const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

var express = require('express')
var router = express.Router()

// GET /push/apn 
router.get('/', function (req, res) {
  res.status(400).send('Apple Push Notification handler is available for POST at /push/apn/send')
})
// GET /push/apn/send 
router.get('/send', function (req, res) {
  res.status(405).send('Sorry you need to POST a JSON')
})

// POST /push/apn/send only gets JSON bodies
router.post('/send', express.json(), async function (req, res) {
  console.log(JSON.stringify(req.body, null, 2));

  if (req.body.options.topic != config.pushProviders.apple.ourAppBundleId) {
    // Forward to another gateway if it is not our app - this may require a subscription
    if (config.pushProviders.apple.forwardGatewayEnable) {
      const forwardGatewayURL = config.pushProviders.apple.forwardGatewayURL || "https://gateway.rocket.chat"
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }      
      try {
        const response = await fetch(forwardGatewayURL, options);
        if (response.ok) {
          logger.info("Succesfully to forwarded request to %s", req.body.options.topic);
          return res.status(200).send("SUCCESS");
        } else {
          logger.error("Failed to forward: %d %s", response.status, response.statusText);
          return res.status(400).send(response.statusText);
        }
      } catch (error) { // deal something like bad proxy, firewall, no network, etc
        logger.error(error);
        return res.status(500).send("Something bad happened on the gateway");
      }
    } else {
      // Not our app, we can't push this and we're not forwarding, so we drop it
      logger.debug("Ignoring Apple BundleId not allowed here: %s", req.body.options.topic);      
      // REVIEW THIS!!!! If respond with 406 Rocket will reap the push token, perhaps it's what we want
      return res.status(200).send("We ignore " + req.body.options.topic);
    }
  }

  let deviceToken = req.body.token;
  let notification = new apn.Notification();
  notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now
  notification.pushType = "alert"
  // if (req.body.options.contentAvailable != null) {
  //   notification.contentAvailable(req.body.options.contentAvailable);
  // }
  notification.contentAvailable = 1;
  notification.sound = req.body.options.sound || "default";
  notification.badge = req.body.options.badge;
  notification.notId = req.body.options.notId;
  notification.topic = req.body.options.topic;
  notification.title = req.body.options.title;
  if (req.body.options.subtitle != null) {
    notification.subtitle = req.body.options.subtitle; // subtitle is valid, but seems Rocket doesn't use yet
  }
  notification.body = req.body.options.text;
  notification.contentAvailable = req.body.options.contentAvailable || null;
  notification.category = req.body.options.apn.category || null; // Test pushes apparently have no category
  notification.payload = req.body.options.payload || {}; // Test pushes apparently have no payload
  // notification.collapseId = req.body.options.apn.collapseId || null;
  notification.threadId = req.body.options.notId || null;
  notification.mutableContent = 1;
  
  console.log(notification.compile());
  // logger.debug("Sending: %s to %s", notification.compile(), deviceToken);
  apnProvider.send(notification, deviceToken)
    .then((result) => {
      if (result.failed.length > 0) {
        logger.error("FAIL, status %s, reason: %s, device: %s", result.failed[0].status, result.failed[0].response.reason, result.failed[0].device);
        // check https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html#//apple_ref/doc/uid/TP40008194-CH11-SW2
        res.status(400).send("FAIL: " + result.failed[0].response.reason)
      } else {
        logger.debug("OK, sent %d", result.sent.length);
        res.status(200).send("SUCCESS")
      }
    })
    .catch(err => { // Network like errors
      logger.error(err)
      res.status(502).send("Something is wrong")
    });
}) // router.post

module.exports = router
