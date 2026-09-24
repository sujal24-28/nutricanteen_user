'use strict';

require('dotenv').config();

const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/database');
const logger = require('./src/utils/logger.util');

const PORT = Number(process.env.PORT);
let server;
let shuttingDown = false;

async function start() {
  try {
    await connectDB();
    server = app.listen(PORT,"0.0.0.0", () => {
      logger.info(`NutriCanteen server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message, stack: err.stack });
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    }
    await sequelize.close();
    logger.info('Shutdown complete.');
  } catch (err) {
    logger.error('Error during shutdown', { message: err.message, stack: err.stack });
    process.exitCode = 1;
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', reason => {
  logger.error('Unhandled Rejection', { reason });
  shutdown('unhandledRejection');
});
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});



start();
