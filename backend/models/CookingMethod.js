const mongoose = require("mongoose");

const cookingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model("CookingMethod", cookingMethodSchema);
