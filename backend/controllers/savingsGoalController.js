import SavingsGoal from "../models/SavingsGoal.js";

const editableFields = ["name", "description", "targetAmount", "targetDate", "color", "paused"];

const goalStatus = (goal) => {
  if (goal.savedAmount >= goal.targetAmount) return "completed";
  if (goal.paused) return "paused";
  if (goal.savedAmount === 0) return "not-started";
  return "in-progress";
};

const serializeGoal = (goal) => ({
  ...goal.toObject(),
  status: goalStatus(goal),
});

export const getSavingsGoals = async (req, res) => {
  const goals = await SavingsGoal.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ goals: goals.map(serializeGoal) });
};

export const createSavingsGoal = async (req, res) => {
  const { name, description, targetAmount, savedAmount = 0, targetDate, color } = req.body;
  const target = Number(targetAmount);
  const saved = Number(savedAmount);

  if (!name?.trim() || !Number.isFinite(target) || target <= 0) {
    return res.status(400).json({ message: "A goal name and target amount greater than zero are required." });
  }
  if (!Number.isFinite(saved) || saved < 0 || saved > target) {
    return res.status(400).json({ message: "Saved amount must be zero or no more than the target amount." });
  }
  if (targetDate && Number.isNaN(new Date(targetDate).getTime())) {
    return res.status(400).json({ message: "Please provide a valid target date." });
  }

  const goal = await SavingsGoal.create({
    user: req.user.id,
    name,
    description,
    targetAmount: target,
    savedAmount: saved,
    targetDate: targetDate || null,
    color,
    contributions: saved > 0 ? [{ amount: saved, date: new Date() }] : [],
  });

  res.status(201).json({ message: "Savings goal created successfully.", goal: serializeGoal(goal) });
};

export const updateSavingsGoal = async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.id });
  if (!goal) return res.status(404).json({ message: "Savings goal not found." });

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) goal[field] = req.body[field];
  });

  if (!goal.name?.trim() || !Number.isFinite(Number(goal.targetAmount)) || Number(goal.targetAmount) <= 0) {
    return res.status(400).json({ message: "A valid goal name and target amount are required." });
  }
  if (goal.savedAmount > Number(goal.targetAmount)) {
    return res.status(400).json({ message: "Target amount cannot be less than the amount already saved." });
  }

  await goal.save();
  res.json({ message: "Savings goal updated successfully.", goal: serializeGoal(goal) });
};

export const addGoalContribution = async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Contribution amount must be greater than zero." });
  }

  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user.id });
  if (!goal) return res.status(404).json({ message: "Savings goal not found." });
  if (goal.paused) return res.status(400).json({ message: "Resume this goal before adding a contribution." });
  if (goal.savedAmount >= goal.targetAmount) return res.status(400).json({ message: "This goal has already been completed." });

  const available = goal.targetAmount - goal.savedAmount;
  const appliedAmount = Math.min(amount, available);
  goal.savedAmount += appliedAmount;
  goal.contributions.push({ amount: appliedAmount, date: new Date() });
  await goal.save();

  res.json({
    message: appliedAmount < amount ? "The contribution completed this goal; only the remaining amount was added." : "Contribution added successfully.",
    goal: serializeGoal(goal),
  });
};

export const deleteSavingsGoal = async (req, res) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!goal) return res.status(404).json({ message: "Savings goal not found." });
  res.status(204).send();
};
