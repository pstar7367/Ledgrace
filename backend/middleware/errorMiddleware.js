export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found." });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "An unexpected error occurred.",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
