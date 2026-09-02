import express from "express";
import {
  addGoalContribution,
  createSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from "../controllers/savingsGoalController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(validateJwt);
router.route("/").get(getSavingsGoals).post(createSavingsGoal);
router.route("/:id").patch(updateSavingsGoal).delete(deleteSavingsGoal);
router.post("/:id/contributions", addGoalContribution);

export default router;
