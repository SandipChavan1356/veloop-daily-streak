const ApiError = require('../utils/ApiError');
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.data ? err.data : {}),
    });
  }

  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ success: false, code: 'INVALID_INPUT', message: 'Invalid request.' });
  }

  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({ success: false, code: 'INVALID_INPUT', message: 'Invalid request.' });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE',
      message: 'This action has already been completed.',
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Unable to process your request. Please try again.',
  });
};

module.exports = errorHandler;
