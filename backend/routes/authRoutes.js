import express from "express";
import passport from "passport";
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendResetCode,
  googleAuthCallback,
  refreshToken,
  getMonthlyIncome,
  updateMonthlyIncome,
} from "../controllers/authController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-code", resendResetCode);
router.get("/refresh-token", validateJwt, refreshToken);
router.get("/monthly-income", validateJwt, getMonthlyIncome);
router.put("/monthly-income", validateJwt, updateMonthlyIncome);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state: CLIENT_URL,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=${encodeURIComponent(
      "Google authentication failed.",
    )}`,
  }),
  googleAuthCallback,
);

export default router;
