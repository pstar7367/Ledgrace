import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ notifications });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true },
  );
  if (!notification)
    return res.status(404).json({ message: "Notification not found." });
  res.json({ notification });
};

export const markNotificationUnread = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: false },
    { new: true },
  );
  if (!notification)
    return res.status(404).json({ message: "Notification not found." });
  res.json({ notification });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true },
  );
  res.json({ message: "All notifications marked as read." });
};

export const markAllNotificationsUnread = async (req, res) => {
  await Notification.updateMany({ user: req.user.id }, { read: false });
  res.json({ message: "All notifications marked as unread." });
};
