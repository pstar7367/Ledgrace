import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from "../controllers/transactionController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(validateJwt);
router.route("/").get(getTransactions).post(createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
