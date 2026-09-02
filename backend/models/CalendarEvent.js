import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Other",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true },
);

calendarEventSchema.index({ user: 1, date: 1 });

export default mongoose.model("CalendarEvent", calendarEventSchema);
