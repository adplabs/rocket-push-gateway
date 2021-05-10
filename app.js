// app.js
/* 
    Push Notification Gateway to be used with Rocket.chat
    Copyright (C) 2020  ADP, Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

const config = require('config');
const express = require('express');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
const app = express();
const port = process.env.PORT || config.port;
const dockerConfig = require('./init/docker');
const routesConfig = require('./init/routes');

logger.debug('Process Environment Variables: %O', process.env);
logger.debug('Configuration: %O', config);

// This app runs behind nginx.  This will look at X-Forwarded-* headers to determine client information
//app.set('trust proxy', true);
app.set('x-powered-by', false);
app.set('etag', false);
app.use(expressLogger);

// Configure all the things
dockerConfig();
routesConfig(app);

app.listen(port);
logger.info('Server listening on port %d', port);

module.exports = app;
