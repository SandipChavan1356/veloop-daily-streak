class ApiError extends Error {
  constructor(statusCode, message, code, data) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.data = data; // optional safe extra fields (e.g. nextClaimAt) returned to the client
  }
}

module.exports = ApiError;
