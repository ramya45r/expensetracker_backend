const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number,  },
  category: { type: String,  },
  description: { type: String },
  income:{ type: Number, required: false},
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", ExpenseSchema);
