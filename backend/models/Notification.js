import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["alert", "reminder", "update", "achievement"],
      default: "update",
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    detail: { type: String, required: true, trim: true, maxlength: 300 },
    read: { type: Boolean, default: false },
    source: { type: String, default: "system", maxlength: 50 },
    sourceId: { type: String, default: "", maxlength: 100 },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
