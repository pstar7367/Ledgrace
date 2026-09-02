import Notification from "../models/Notification.js";

export default function createNotification({
  user,
  type = "update",
  title,
  detail,
  source,
  sourceId,
}) {
  return Notification.create({
    user,
    type,
    title,
    detail,
    source,
    sourceId,
  }).catch((error) => {
    console.error("Notification write failed:", error.message);
    return null;
  });
}
