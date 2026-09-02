import Transaction from "../models/Transaction.js";
import createNotification from "../utils/createNotification.js";

const validTypes = new Set(["income", "expense"]);

const validateTransaction = ({ title, amount, type, category }) => {
  if (!title?.trim() || !category?.trim() || !validTypes.has(type)) {
    return "Please provide a title, category, and valid transaction type.";
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return "Transaction amount must be greater than zero.";
  }

  return null;
};

export const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json({ transactions });
};

export const createTransaction = async (req, res) => {
  const { clientId, title, amount, type, category, date } = req.body;
  const validationError = validateTransaction({
    title,
    amount,
    type,
    category,
  });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!clientId?.trim()) {
    return res
      .status(400)
      .json({ message: "A transaction identifier is required." });
  }

  const existing = await Transaction.findOne({ user: req.user.id, clientId });
  if (existing) {
    return res
      .status(200)
      .json({ message: "Transaction already saved.", transaction: existing });
  }

  const transaction = await Transaction.create({
    user: req.user.id,
    clientId,
    title,
    amount: Number(amount),
    type,
    category,
    date:
      date ||
      new Date().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  });
  await createNotification({
    user: req.user.id,
    type: type === "expense" ? "alert" : "update",
    title: `${type === "expense" ? "Expense" : "Income"} recorded`,
    detail: `${title} of ${Number(amount).toLocaleString("en-NG", { style: "currency", currency: "NGN" })} was added.`,
    source: "transaction",
    sourceId: transaction.id,
  });

  res
    .status(201)
    .json({ message: "Transaction saved successfully.", transaction });
};

export const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }
  await createNotification({
    user: req.user.id,
    title: "Transaction deleted",
    detail: `${transaction.title} was removed from your activity.`,
    source: "transaction",
    sourceId: transaction.id,
  });

  res.status(204).send();
};
