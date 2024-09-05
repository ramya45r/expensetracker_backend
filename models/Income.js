const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  income: { type: Number,},
});

module.exports = mongoose.model("Income", IncomeSchema);
