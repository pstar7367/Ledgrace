import express from "express";
import {
  submitContactMessage,
  subscribeToNewsletter,
} from "../controllers/publicController.js";

const router = express.Router();
router.post("/contact", submitContactMessage);
router.post("/newsletter", subscribeToNewsletter);

export default router;
