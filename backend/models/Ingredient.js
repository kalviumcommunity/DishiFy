const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  recipe: { type: String, required: true },
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
