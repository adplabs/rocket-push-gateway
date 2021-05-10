'use strict';

const apple  = require('../routes/apple');
const google = require('../routes/google');
const root   = require('../routes/root');

/**
 * Adds routes
 *
 * @param {Express.Application} app The Express application
 */
function routesConfig(app) {
	// Global route to disable HTTP verbs 
	app.all('*', (req, res, next) => {
		if (req.method === 'GET' || req.method === 'POST' || req.method === 'HEAD') {
			next();
		} else {
			res.status(405).send('Method Not Allowed');
		}
	});

	app.use('/push/apn/', apple);
	app.use('/push/gcm/', google);
	app.use('/', root);
}

module.exports = routesConfig;

