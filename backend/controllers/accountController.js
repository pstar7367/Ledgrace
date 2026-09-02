import Account from "../models/Account.js";
import createNotification from "../utils/createNotification.js";

const allowedFields = ["name", "type", "provider", "color", "archived"];

export const getAccounts = async (req, res) => {
  const includeArchived = req.query.archived === "true";
  const accounts = await Account.find({
    user: req.user.id,
    ...(includeArchived ? {} : { archived: false }),
  }).sort({ createdAt: -1 });
  res.json({ accounts });
};

export const createAccount = async (req, res) => {
  const { name, type, provider, startingBalance, color } = req.body;
  if (!name || !type || !provider || startingBalance === undefined)
    return res.status(400).json({
      message: "Name, type, provider, and starting balance are required.",
    });
  const balance = Number(startingBalance);
  if (!Number.isFinite(balance) || balance < 0)
    return res
      .status(400)
      .json({ message: "Starting balance must be zero or greater." });
  const account = await Account.create({
    user: req.user.id,
    name,
    type,
    provider,
    startingBalance: balance,
    currentBalance: balance,
    color,
  });
  await createNotification({
    user: req.user.id,
    title: "Account added",
    detail: `${account.name} is now being tracked.`,
    source: "account",
    sourceId: account.id,
  });
  res.status(201).json({ message: "Account created successfully.", account });
};

export const updateAccount = async (req, res) => {
  const account = await Account.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!account) return res.status(404).json({ message: "Account not found." });
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) account[field] = req.body[field];
  });
  await account.save();
  await createNotification({
    user: req.user.id,
    title: "Account updated",
    detail: `${account.name} was updated.`,
    source: "account",
    sourceId: account.id,
  });
  res.json({ account });
};

export const archiveAccount = async (req, res) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { archived: true },
    { new: true },
  );
  if (!account) return res.status(404).json({ message: "Account not found." });
  await createNotification({
    user: req.user.id,
    title: "Account archived",
    detail: `${account.name} was moved out of your active accounts.`,
    source: "account",
    sourceId: account.id,
  });
  res.json({ account });
};

export const deleteAccount = async (req, res) => {
  const account = await Account.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!account) return res.status(404).json({ message: "Account not found." });
  await createNotification({
    user: req.user.id,
    title: "Account deleted",
    detail: `${account.name} was removed.`,
    source: "account",
    sourceId: account.id,
  });
  res.status(204).send();
};
