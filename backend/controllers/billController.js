import Bill from "../models/Bill.js";
import createNotification from "../utils/createNotification.js";

const validFrequencies = new Set([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
]);
const validTypes = new Set(["bill", "subscription"]);

const validateBill = ({ name, amount, frequency, type, dueDate }) => {
  if (!name?.trim()) {
    return "Bill name is required.";
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return "Bill amount must be greater than zero.";
  }

  if (!validFrequencies.has(frequency)) {
    return "Invalid frequency.";
  }

  if (!validTypes.has(type)) {
    return "Invalid bill type.";
  }

  const dueDateNum = Number(dueDate);
  if (!Number.isFinite(dueDateNum) || dueDateNum < 1 || dueDateNum > 31) {
    return "Due date must be between 1 and 31.";
  }

  return null;
};

const calculateNextDueDate = (frequency, dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDue = new Date(today);

  switch (frequency) {
    case "daily":
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case "weekly":
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case "biweekly":
      nextDue.setDate(nextDue.getDate() + 14);
      break;
    case "monthly":
      nextDue.setDate(dueDate);
      if (nextDue <= today) {
        nextDue.setMonth(nextDue.getMonth() + 1);
        nextDue.setDate(dueDate);
      }
      break;
    case "quarterly":
      nextDue.setDate(dueDate);
      nextDue.setMonth(nextDue.getMonth() + 3);
      if (nextDue <= today) {
        nextDue.setMonth(nextDue.getMonth() + 3);
      }
      break;
    case "yearly":
      nextDue.setDate(dueDate);
      if (nextDue <= today) {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }
      break;
  }

  return nextDue;
};

export const getBills = async (req, res) => {
  const bills = await Bill.find({ user: req.user.id }).sort({
    nextDueDate: 1,
    createdAt: -1,
  });
  res.json({ bills });
};

export const createBill = async (req, res) => {
  const {
    name,
    description,
    amount,
    frequency,
    dueDate,
    type,
    category,
    paymentMethod,
    notes,
  } = req.body;

  const validationError = validateBill({
    name,
    amount,
    frequency,
    type,
    dueDate,
  });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const nextDueDate = calculateNextDueDate(frequency, Number(dueDate));

  const bill = await Bill.create({
    user: req.user.id,
    name,
    description: description || "",
    amount: Number(amount),
    frequency,
    dueDate: Number(dueDate),
    type,
    category: category || "Other",
    paymentMethod: paymentMethod || "",
    nextDueDate,
    notes: notes || "",
    isActive: true,
  });
  await createNotification({
    user: req.user.id,
    type: "reminder",
    title: "Bill added",
    detail: `${bill.name} is scheduled for ${bill.nextDueDate.toLocaleDateString("en-NG")}.`,
    source: "bill",
    sourceId: bill.id,
  });

  res.status(201).json({ message: "Bill created successfully.", bill });
};

export const updateBill = async (req, res) => {
  const {
    name,
    description,
    amount,
    frequency,
    dueDate,
    type,
    category,
    paymentMethod,
    status,
    notes,
    isActive,
  } = req.body;

  const validationError = validateBill({
    name,
    amount,
    frequency,
    type,
    dueDate,
  });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const bill = await Bill.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    {
      name,
      description: description || "",
      amount: Number(amount),
      frequency,
      dueDate: Number(dueDate),
      type,
      category: category || "Other",
      paymentMethod: paymentMethod || "",
      status: status || bill?.status || "active",
      notes: notes || "",
      nextDueDate: calculateNextDueDate(frequency, Number(dueDate)),
      isActive: isActive !== undefined ? isActive : true,
    },
    { new: true },
  );

  if (!bill) {
    return res.status(404).json({ message: "Bill not found." });
  }
  await createNotification({
    user: req.user.id,
    title: "Bill updated",
    detail: `${bill.name} was updated.`,
    source: "bill",
    sourceId: bill.id,
  });

  res.json({ message: "Bill updated successfully.", bill });
};

export const markBillAsPaid = async (req, res) => {
  const bill = await Bill.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    {
      status: "paid",
      lastPaidDate: new Date(),
      nextDueDate: calculateNextDueDate(
        (await Bill.findById(req.params.id)).frequency,
        (await Bill.findById(req.params.id)).dueDate,
      ),
    },
    { new: true },
  );

  if (!bill) {
    return res.status(404).json({ message: "Bill not found." });
  }
  await createNotification({
    user: req.user.id,
    type: "update",
    title: "Bill marked as paid",
    detail: `${bill.name} was marked as paid.`,
    source: "bill",
    sourceId: bill.id,
  });

  res.json({ message: "Bill marked as paid.", bill });
};

export const deleteBill = async (req, res) => {
  const bill = await Bill.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!bill) {
    return res.status(404).json({ message: "Bill not found." });
  }

  await createNotification({
    user: req.user.id,
    title: "Bill deleted",
    detail: `${bill.name} was removed from your bills.`,
    source: "bill",
    sourceId: bill.id,
  });

  res.status(204).send();
};
