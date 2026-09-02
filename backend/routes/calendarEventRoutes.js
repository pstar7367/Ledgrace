import express from "express";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
} from "../controllers/calendarEventController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(validateJwt);
router.route("/").get(getCalendarEvents).post(createCalendarEvent);
router.delete("/:id", deleteCalendarEvent);

export default router;
