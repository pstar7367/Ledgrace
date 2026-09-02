import dotenv from "dotenv";
import "express-async-errors";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import savingsGoalRoutes from "./routes/savingsGoalRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import calendarEventRoutes from "./routes/calendarEventRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Debug: remove this after verification
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Load Passport AFTER dotenv
await import("./config/passport.js");

const app = express();

const PORT = Number(process.env.PORT || 4000);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/calendar-events", calendarEventRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ledgrace Authentication API is running.",
  });
});

app.use(notFound);
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = Number(process.env.FALLBACK_PORT || 4001);
      if (port === fallbackPort) {
        console.error(
          `Port ${port} is already in use. Please stop the process using this port or set a different PORT.`,
        );
        process.exit(1);
      }
      console.warn(`Port ${port} is in use. Falling back to ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }
    console.error("Server error:", error);
    process.exit(1);
  });
};

try {
  await connectDb();
  startServer(PORT);
} catch (error) {
  console.error("MongoDB connection failed:", error);
  startServer(PORT);
}
