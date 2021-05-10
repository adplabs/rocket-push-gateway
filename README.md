# rocket-push-gateway
A Push Notification Gateway to be used with Rocket.chat

### What 
We use the excellent open source project [Rocket.chat](https://rocket.chat), and this project here is to work with it, to facilitate sending its iOS and Android Push Notifications. 

You _may_ want to use this if:

* You have network constraints: due to our internal security constraints, we can't host the Rocket server on a network with direct access to the Internet, so we need to use a gateway to send the Push notifications to our in-house built iOS and Android apps.

* If you develop your own app, and want other servers to be able to use it, with push, then you need to setup your own gateway, and allow them to use it. You should probably setup a SSL terminating proxy (Apache, nginx, F5, AWS ELB, etc) in front of this gateway, in this particular scenario.

* You host your own server, but you also want to use the official Rocket.chat mobile apps, in addition to your own apps (some folks don't want the internal MDM on their phones, contractors, temps, etc), so you need a place to send the notifications to your own apps using your keys, but also forward a copy to Rocket's Push Gateway (this may require a subscription from them).

You _don't_ really need this if:

* You Rocket servers have direct access to the Internet
  - If you use your own apps, simply add your iOS certificate and FCM server key and push away
  - If you use Rocket's mobile apps, then you need to use their Push Gateway, likely with a subscription.



### Build & Run

This project depends on node.js and possibly [Docker](https://www.docker.com/) or something like [PM2](https://www.npmjs.com/package/pm2) to run it on the shell.

#### Docker

* To use Docker, simply use the included docker-compose.yml file:

- build the container
`docker-compose build`

- run it
`docker-compose up`


* if you prefer the manual steps:

- build the container
`docker build -t rocket-push-gateway:latest .`

  - if you prefer, you can pull my public image
  `docker pull alvarow/rocket-push-gateway:latest`

- run it
`docker run -d --rm --name rocket-push-gateway -p 0.0.0.0:11000:11000 -e LOG_LEVEL=error -e NODE=${NODE_CONFIG} rocket-push-gateway:latest`

#### Good old shell

To use on shell, with PM2, screen or systemd, you'll need [node.js](https://nodejs.org/en/download/package-manager/), I used v14.5.x, but it should work on any reasonably new LTS version.

- see https://nodejs.org/en/download/package-manager/ to get node.js installed

- install the app dependencies
`npm ci`

- run it manually
`npm start`

  - optionally install [PM2](https://www.npmjs.com/package/pm2) and run it through that (see [details](https://pm2.keymetrics.io/docs/usage/quick-start/)). 
  `npm install pm2@latest -g`
  `pm2 start app.js --name rocket-push-gateway`
  `pm2 stop rocket-push-gateway`



### Usage & Tips

The `config/` folder has a `default.js` that you can override in the various ways, see https://github.com/lorenwest/node-config for details. In short:

- either:

   - **Configuration file**  place a file in the `config/` folder:
     - local.js       `# overrides to defaults that's always loaded if present`
     - development.js `# overrides to defaults when NODE_ENV=development`
     - production.js  `# overrides to defaults when NODE_ENV=production`

   - **Environment variables** I prefer this, _especially_ with Docker, just set the following: 
     - PORT           `# this defaults to 11000`
     - LOG_LEVEL      `# defaults to info. pick: debug, info, warning, error`
     - NODE_CONFIG    `# this is a single line version of the config file, with the options you want different from the defaults`

See `contrib/` folder for a sample [systemd](https://www.freedesktop.org/software/systemd/man/systemd.service.html) service, a sample `NODE_CONFIG` value and a PM2 service configuration.



### Disclaimer of Warranty

The software is provided "as is", *without warranty* of any kind, express or implied. For details, please see LICENSE.md

