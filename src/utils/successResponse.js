/**
 * ## successResponse
 * * Custom success response
 * @param {HTTPResponse} res - HTTP Response
 * @param {Number} statusCode
 * @param {String} message
 * @param {*} data
 * @returns
 */

export const successResponse = (
  res,
  statusCode,
  message = null,
  data = null
) => {
  const response = {};

  if (message) response.message = message;
  if (data) response.data = data;
  return res
    .status(statusCode)
    .json({ success: true, ...response, statusCode });
};
