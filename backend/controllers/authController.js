import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email.js";

const createJwt = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
  );
};

const buildAuthResponse = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  verified: user.verified,
  token: createJwt(user),
});

const generateOtp = () => crypto.randomInt(100000, 1000000).toString().padStart(6, "0");

const ensureDatabaseReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database is temporarily unavailable. Please try again shortly." });
    return false;
  }
  return true;
};

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Please complete all required fields." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists. Please log in instead.",
    });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    verificationToken,
  });

  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({
    message: "Account created. Check your email to verify your address.",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verified: user.verified,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({
      message: "Account not found. Please sign up if you haven't created an account.",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: "Incorrect password. Please try again.",
    });
  }

  if (!user.verified) {
    return res.status(403).json({
      message: "Email not verified. Please check your inbox for verification instructions.",
    });
  }

  res.json(buildAuthResponse(user));
};

export const verifyEmail = async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification token." });
  }

  user.verified = true;
  user.verificationToken = null;
  await user.save();

  res.json({
    message: "Email verified successfully. Welcome to Ledgrace!",
    ...buildAuthResponse(user),
  });
};

export const forgotPassword = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    const otp = generateOtp();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 5 * 60 * 1000;
    user.passwordResetAttempts = 0;
    user.passwordResetLockedUntil = null;
    await user.save();

    try {
      await sendResetPasswordEmail(user.email, user.firstName || "there", otp);
    } catch (mailError) {
      user.passwordResetOTP = null;
      user.passwordResetExpires = null;
      user.passwordResetAttempts = 0;
      user.passwordResetLockedUntil = null;
      await user.save();

      return res.status(500).json({
        message: `Unable to send the verification code to ${normalizedEmail}. SMTP delivery failed: ${mailError.message}`,
      });
    }

    return res.json({ message: "A new verification code has been sent." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    if (error.message && error.message.includes("SMTP")) {
      return res.status(500).json({
        message: `Unable to send the verification code. SMTP error: ${error.message}`,
      });
    }
    return res.status(500).json({ message: "Unable to process your request right now." });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!user.passwordResetOTP || !user.passwordResetExpires) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.passwordResetLockedUntil && user.passwordResetLockedUntil > Date.now()) {
      return res.status(403).json({
        message: "Too many failed attempts. Please request a new verification code.",
      });
    }

    if (user.passwordResetExpires <= Date.now()) {
      user.passwordResetOTP = null;
      user.passwordResetExpires = null;
      user.passwordResetAttempts = 0;
      user.passwordResetLockedUntil = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired." });
    }

    if (String(user.passwordResetOTP) !== String(otp).trim()) {
      const attempts = (user.passwordResetAttempts || 0) + 1;
      user.passwordResetAttempts = attempts;

      if (attempts >= 3) {
        user.passwordResetLockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        user.passwordResetOTP = null;
        user.passwordResetExpires = null;
      }

      await user.save();

      if (attempts >= 3) {
        return res.status(403).json({
          message: "Too many failed attempts. Please request a new verification code.",
        });
      }

      return res.status(400).json({
        message: `Invalid verification code. ${3 - attempts} attempts remaining before lockout.`,
      });
    }

    user.passwordResetAttempts = 0;
    user.passwordResetLockedUntil = null;
    await user.save();

    return res.json({ message: "Verification code verified successfully." });
  } catch (error) {
    console.error("verifyResetCode error:", error);
    return res.status(500).json({ message: "Unable to process your request right now." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email, otp, password, confirmPassword } = req.body;
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please complete all fields." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!user.passwordResetOTP || !user.passwordResetExpires) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.passwordResetLockedUntil && user.passwordResetLockedUntil > Date.now()) {
      return res.status(403).json({
        message: "Too many failed attempts. Please request a new verification code.",
      });
    }

    if (user.passwordResetExpires <= Date.now()) {
      user.passwordResetOTP = null;
      user.passwordResetExpires = null;
      user.passwordResetAttempts = 0;
      user.passwordResetLockedUntil = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired." });
    }

    if (String(user.passwordResetOTP) !== String(otp).trim()) {
      const attempts = (user.passwordResetAttempts || 0) + 1;
      user.passwordResetAttempts = attempts;

      if (attempts >= 3) {
        user.passwordResetLockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        user.passwordResetOTP = null;
        user.passwordResetExpires = null;
      }

      await user.save();

      if (attempts >= 3) {
        return res.status(403).json({
          message: "Too many failed attempts. Please request a new verification code.",
        });
      }

      return res.status(400).json({
        message: `Invalid verification code. ${3 - attempts} attempts remaining before lockout.`,
      });
    }

    user.password = password;
    user.passwordResetOTP = null;
    user.passwordResetExpires = null;
    user.passwordResetAttempts = 0;
    user.passwordResetLockedUntil = null;
    await user.save();

    return res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Unable to process your request right now." });
  }
};

export const resendResetCode = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
      return res.status(429).json({
        message: "Please wait until the current code expires before requesting a new one.",
      });
    }

    const otp = generateOtp();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 5 * 60 * 1000;
    user.passwordResetAttempts = 0;
    user.passwordResetLockedUntil = null;
    await user.save();

    try {
      await sendResetPasswordEmail(user.email, user.firstName || "there", otp);
    } catch (mailError) {
      user.passwordResetOTP = null;
      user.passwordResetExpires = null;
      user.passwordResetAttempts = 0;
      user.passwordResetLockedUntil = null;
      await user.save();

      return res.status(500).json({
        message: `Unable to send the verification code to ${normalizedEmail}. SMTP delivery failed: ${mailError.message}`,
      });
    }

    return res.json({ message: "A new verification code has been sent." });
  } catch (error) {
    console.error("resendResetCode error:", error);
    if (error.message && error.message.includes("SMTP")) {
      return res.status(500).json({
        message: `Unable to send the verification code. SMTP error: ${error.message}`,
      });
    }
    return res.status(500).json({ message: "Unable to process your request right now." });
  }
};

export const googleAuthRedirect = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?googleAuth=failed`);
};

export const googleAuthCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
        "Google authentication failed.",
      )}`,
    );
  }

  const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const token = createJwt(req.user);
  res.redirect(`${redirectUrl}/login?token=${encodeURIComponent(token)}`);
};

export const refreshToken = async (req, res) => {
  res.json({ token: createJwt(req.user) });
};

export const getMonthlyIncome = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("monthlyIncome");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ monthlyIncome: user.monthlyIncome || 0 });
  } catch (error) {
    console.error("getMonthlyIncome error:", error);
    res.status(500).json({ message: "Unable to retrieve your income." });
  }
};

export const updateMonthlyIncome = async (req, res) => {
  try {
    const { monthlyIncome } = req.body;
    if (monthlyIncome === undefined || monthlyIncome === null) {
      return res.status(400).json({ message: "Monthly income is required." });
    }

    const income = Number(monthlyIncome);
    if (!Number.isFinite(income) || income < 0) {
      return res.status(400).json({ message: "Monthly income must be a non-negative number." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { monthlyIncome: income },
      { new: true, runValidators: true }
    ).select("monthlyIncome");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Income updated successfully.", monthlyIncome: user.monthlyIncome });
  } catch (error) {
    console.error("updateMonthlyIncome error:", error);
    res.status(500).json({ message: "Unable to update your income." });
  }
};
