const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { sanitizeInput } = require('./middleware/sanitize.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

if (env.trustProxy) app.set('trust proxy', env.trustProxy);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(sanitizeInput);
if (!env.isProduction) app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', serverTime: new Date().toISOString() }));

app.use('/api', routes);

app.use((req, res, next) => next(new ApiError(404, 'Not found.', 'NOT_FOUND')));

app.use(errorHandler);

module.exports = app;
