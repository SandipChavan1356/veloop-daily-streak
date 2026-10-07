class ApiError extends Error {
  constructor(statusCode, message, code, data) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.data = data; 
  }
}

module.exports = ApiError;
