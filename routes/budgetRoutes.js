const express = require("express");
const Budget = require("../models/Budget");
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

// Get all budgets
router.get("/", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new budget
router.post("/", authMiddleware, async (req, res) => {
  const { category, budgetLimit } = req.body;

  try {
    const budget = new Budget({
      user: req.user,
      category,
      budgetLimit
    });

    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(400).json({ message: "Bad request" });
  }
});

// Update an existing budget
router.put("/:id", authMiddleware, async (req, res) => {
  const { category, budgetLimit } = req.body;

  try {
    const budget = await Budget.findById(req.params.id);
    if (budget.user.toString() !== req.user) return res.status(401).json({ message: "Unauthorized" });

    budget.category = category || budget.category;
    budget.budgetLimit = budgetLimit || budget.budgetLimit;

    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(400).json({ message: "Bad request" });
  }
});

// Delete a budget
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (budget.user.toString() !== req.user) return res.status(401).json({ message: "Unauthorized" });

    await budget.remove();
    res.json({ message: "Budget removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
