/* global process */
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const validateJwt = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing." });
    }

    const token = authHeader.slice(7).trim();
    if (!token || token === "null" || token === "undefined") {
      return res
        .status(401)
        .json({ message: "A valid authorization token is required." });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token or user does not exist." });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Invalid authorization token. Please log in again.";
    res.status(401).json({ message });
  }
};
