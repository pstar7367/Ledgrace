import express from "express";
import {
  createBill,
  deleteBill,
  getBills,
  updateBill,
  markBillAsPaid,
} from "../controllers/billController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(validateJwt);
router.route("/").get(getBills).post(createBill);
router.put("/:id", updateBill);
router.patch("/:id/mark-paid", markBillAsPaid);
router.delete("/:id", deleteBill);

export default router;
