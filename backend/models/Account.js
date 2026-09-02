import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, required: true, enum: ["Bank", "E-Wallet", "Card", "Wallet"] },
    provider: { type: String, required: true, trim: true, maxlength: 80 },
    startingBalance: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, min: 0 },
    color: { type: String, default: "#1458ed", match: /^#[0-9a-fA-F]{6}$/ },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Account", accountSchema);
