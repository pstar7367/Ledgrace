import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    dueDate: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    type: {
      type: String,
      enum: ["bill", "subscription"],
      default: "bill",
    },
    status: {
      type: String,
      enum: ["active", "paid", "overdue", "paused"],
      default: "active",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Other",
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    nextDueDate: {
      type: Date,
    },
    lastPaidDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

billSchema.index({ user: 1, isActive: 1 });

export default mongoose.model("Bill", billSchema);
