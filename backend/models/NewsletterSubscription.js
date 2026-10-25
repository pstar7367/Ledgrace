import mongoose from "mongoose";

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      unique: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("NewsletterSubscription", newsletterSubscriptionSchema);
