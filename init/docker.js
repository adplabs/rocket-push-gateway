'use strict';

const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

/**
 * Does what it says :-)
 */
function endProcess() {
	//console.log('Quitting...');
	logger.warn('Quitting...');
	process.exit(0);
}

/**
 * Adds hooks for Docker to exit gracefully
 */
function dockerConfig() {
	// Ctrl+C
	process.on('SIGINT', () => {
		endProcess();
	});
	// docker stop
	process.on('SIGTERM', () => {
		endProcess();
	});
	// Ooops
	process.on('uncaughtException', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'uncaughtException')
		process.exit(2)
	}))
	// hummm
	process.on('unhandledRejection', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'unhandledRejection')
		process.exit(3)
	}))
}

module.exports = dockerConfig;

