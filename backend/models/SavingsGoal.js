import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 180, default: "" },
    targetAmount: { type: Number, required: true, min: 0.01 },
    savedAmount: { type: Number, required: true, min: 0, default: 0 },
    targetDate: { type: Date, default: null },
    color: { type: String, default: "#1458ed", match: /^#[0-9a-fA-F]{6}$/ },
    paused: { type: Boolean, default: false },
    contributions: { type: [contributionSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("SavingsGoal", savingsGoalSchema);
