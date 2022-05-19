/**
 * ## errorResponse
 * * Custom error response
 * @param {String} message - Error message
 * @param {Number} statusCode - Status code http
 * @returns {Error} new Error()
 */
export const errorResponse = (statusCode, message = null) => {
  const error = new Error();
  error.statusCode = statusCode;
  if (message) error.message = message;

  return error;
};
