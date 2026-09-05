import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: String,
      default: "",
      trim: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    timeZone: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    password: {
      type: String,
      required: true,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorCode: {
      type: String,
      default: null,
    },

    twoFactorExpires: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    loginActivity: {
      type: [{
        at: { type: Date, required: true },
        ip: { type: String, default: "" },
        userAgent: { type: String, default: "" },
      }],
      default: [],
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // Authentication Provider
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Google ID
    googleId: {
      type: String,
      default: null,
    },

    // Profile Picture
    avatar: {
      type: String,
      default: "",
    },

    subscriptionPlan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },

    // Email Verification
    verificationToken: {
      type: String,
      default: null,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetCode: {
      type: String,
      default: null,
    },

    passwordResetOTP: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    passwordResetAttempts: {
      type: Number,
      default: 0,
    },

    passwordResetLockedUntil: {
      type: Date,
      default: null,
    },

    // Monthly Income for budgeting
    monthlyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
