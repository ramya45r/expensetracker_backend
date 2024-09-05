const express = require("express");
const Expense = require("../models/Expense");
const jwt = require("jsonwebtoken");
const Income = require("../models/Income");
const router = express.Router();

// Middleware for authenticating users
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
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
  console.log(expenses,'expenses');
  
  res.json(expenses);
});

// Add new expense
router.post("/", authMiddleware, async (req, res) => {
  console.log(req.body, 'Request Body');
  const { amount, category, description } = req.body;
  if (!amount || !category || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const expense = new Expense({ user: req.user, amount, category, description });
    await expense.save();
    res.json(expense);
    console.log(expense, 'Expense Created');
  } catch (err) {
    console.error('Error Creating Expense:', err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/income", authMiddleware, async (req, res) => {
  console.log(req.body, 'Request Body');
  const { income } = req.body;
  console.log(income,'income');
  
  if (!income) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const expense = new Income({ income:income,user: req.user });
    await expense.save();
    res.json(expense);
    console.log(expense, 'Income Created');
  } catch (err) {
    console.error('Error Creating Income:', err);
    res.status(500).json({ message: "Server Error" });
  }
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
