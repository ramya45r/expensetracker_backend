const express = require("express");
const Expense = require("../models/Expense");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware for authenticating users
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get expenses
router.get("/", authMiddleware, async (req, res) => {
  const expenses = await Expense.find({ user: req.user });
  res.json(expenses);
});

// Add new expense
router.post("/", authMiddleware, async (req, res) => {
  const { amount, category, description } = req.body;
  const expense = new Expense({ user: req.user, amount, category, description });
  await expense.save();
  res.json(expense);
});

// Update expense
router.put("/:id", authMiddleware, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (expense.user.toString() !== req.user) return res.status(401).json({ message: "Unauthorized" });

  Object.assign(expense, req.body);
  await expense.save();
  res.json(expense);
});

// Delete expense
router.delete("/:id", authMiddleware, async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (expense.user.toString() !== req.user) return res.status(401).json({ message: "Unauthorized" });

  await expense.remove();
  res.json({ message: "Expense removed" });
});

module.exports = router;
