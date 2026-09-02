import express from "express";
import { archiveAccount, createAccount, deleteAccount, getAccounts, updateAccount } from "../controllers/accountController.js";
import { validateJwt } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(validateJwt);
router.route("/").get(getAccounts).post(createAccount);
router.route("/:id").patch(updateAccount).delete(deleteAccount);
router.patch("/:id/archive", archiveAccount);
export default router;
