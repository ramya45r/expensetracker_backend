const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(process.env.JWT_SECRET,'process.env.JWT_SECRE');
  
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = new User({ name, email, password });
  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

module.exports = router;
