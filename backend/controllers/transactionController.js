import Transaction from "../models/Transaction.js";

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
  const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ transactions });
};

export const createTransaction = async (req, res) => {
  const { clientId, title, amount, type, category, date } = req.body;
  const validationError = validateTransaction({ title, amount, type, category });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!clientId?.trim()) {
    return res.status(400).json({ message: "A transaction identifier is required." });
  }

  const existing = await Transaction.findOne({ user: req.user.id, clientId });
  if (existing) {
    return res.status(200).json({ message: "Transaction already saved.", transaction: existing });
  }

  const transaction = await Transaction.create({
    user: req.user.id,
    clientId,
    title,
    amount: Number(amount),
    type,
    category,
    date: date || new Date().toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  });

  res.status(201).json({ message: "Transaction saved successfully.", transaction });
};

export const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  res.status(204).send();
};
