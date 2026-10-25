import ContactMessage from "../models/ContactMessage.js";
import NewsletterSubscription from "../models/NewsletterSubscription.js";
import { sendContactMessageEmail } from "../utils/email.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeToNewsletter = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  if (!emailPattern.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  await NewsletterSubscription.updateOne(
    { email },
    { $set: { active: true }, $setOnInsert: { email } },
    { upsert: true, runValidators: true },
  );
  res.status(200).json({ message: "You are subscribed to Ledgrace updates." });
};

export const submitContactMessage = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !emailPattern.test(email) || !subject || !message) {
    return res
      .status(400)
      .json({ message: "Complete all fields with a valid email address." });
  }
  if (
    name.length > 120 ||
    email.length > 254 ||
    subject.length > 160 ||
    message.length > 5000
  ) {
    return res
      .status(400)
      .json({ message: "One or more fields are longer than allowed." });
  }

  const contactMessage = await ContactMessage.create({ name, email, subject, message });
  try {
    await sendContactMessageEmail({ name, email, subject, message });
  } catch (error) {
    console.error("Contact message email notification failed:", error.message);
  }
  res.status(201).json({
    message: "Your message has been sent successfully.",
    reference: contactMessage.id,
  });
};
