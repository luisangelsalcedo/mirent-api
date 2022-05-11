/**
 * ## errorHandler
 * * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const { message } = err;
  let { statusCode = 500 } = err;

  // Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 422;
  }
  // console.log(err.errors.email.message);
  res.status(statusCode).json({ error: true, statusCode, message });
};
