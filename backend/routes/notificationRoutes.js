import express from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  markAllNotificationsUnread,
  markNotificationRead,
  markNotificationUnread,
} from "../controllers/notificationController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(validateJwt);
router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/unread-all", markAllNotificationsUnread);
router.patch("/:id/read", markNotificationRead);
router.patch("/:id/unread", markNotificationUnread);

export default router;
