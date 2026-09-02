import CalendarEvent from "../models/CalendarEvent.js";
import createNotification from "../utils/createNotification.js";

const validateEvent = ({ title, date, amount }) => {
  if (!title?.trim()) return "Event title is required.";
  if (!date || Number.isNaN(new Date(date).getTime()))
    return "A valid event date is required.";
  if (
    amount !== undefined &&
    (!Number.isFinite(Number(amount)) || Number(amount) < 0)
  ) {
    return "Event amount cannot be negative.";
  }
  return null;
};

export const getCalendarEvents = async (req, res) => {
  const events = await CalendarEvent.find({ user: req.user.id }).sort({
    date: 1,
    createdAt: -1,
  });
  res.json({ events });
};

export const createCalendarEvent = async (req, res) => {
  const { title, date, amount, category, notes } = req.body;
  const validationError = validateEvent({ title, date, amount });
  if (validationError)
    return res.status(400).json({ message: validationError });

  const event = await CalendarEvent.create({
    user: req.user.id,
    title,
    date,
    amount: Number(amount || 0),
    category: category || "Other",
    notes: notes || "",
  });
  await createNotification({
    user: req.user.id,
    type: "reminder",
    title: "Calendar event added",
    detail: `${event.title} was added for ${new Date(event.date).toLocaleDateString("en-NG")}.`,
    source: "calendar",
    sourceId: event.id,
  });

  res
    .status(201)
    .json({ message: "Calendar event created successfully.", event });
};

export const deleteCalendarEvent = async (req, res) => {
  const event = await CalendarEvent.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!event)
    return res.status(404).json({ message: "Calendar event not found." });
  await createNotification({
    user: req.user.id,
    title: "Calendar event deleted",
    detail: `${event.title} was removed from your calendar.`,
    source: "calendar",
    sourceId: event.id,
  });
  res.status(204).send();
};
