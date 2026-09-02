import Account from "../models/Account.js";

const allowedFields = ["name", "type", "provider", "color", "archived"];

export const getAccounts = async (req, res) => {
  const includeArchived = req.query.archived === "true";
  const accounts = await Account.find({ user: req.user.id, ...(includeArchived ? {} : { archived: false }) }).sort({ createdAt: -1 });
  res.json({ accounts });
};

export const createAccount = async (req, res) => {
  const { name, type, provider, startingBalance, color } = req.body;
  if (!name || !type || !provider || startingBalance === undefined) return res.status(400).json({ message: "Name, type, provider, and starting balance are required." });
  const balance = Number(startingBalance);
  if (!Number.isFinite(balance) || balance < 0) return res.status(400).json({ message: "Starting balance must be zero or greater." });
  const account = await Account.create({ user: req.user.id, name, type, provider, startingBalance: balance, currentBalance: balance, color });
  res.status(201).json({ message: "Account created successfully.", account });
};

export const updateAccount = async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id, user: req.user.id });
  if (!account) return res.status(404).json({ message: "Account not found." });
  allowedFields.forEach((field) => { if (req.body[field] !== undefined) account[field] = req.body[field]; });
  await account.save();
  res.json({ account });
};

export const archiveAccount = async (req, res) => {
  const account = await Account.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { archived: true }, { new: true });
  if (!account) return res.status(404).json({ message: "Account not found." });
  res.json({ account });
};

export const deleteAccount = async (req, res) => {
  const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!account) return res.status(404).json({ message: "Account not found." });
  res.status(204).send();
};
