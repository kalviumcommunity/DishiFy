const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  time: { type: String, required: true },
  difficulty: { type: String, required: true },
  category: { type: String, required: true },
  cookingMethod: { type: String, required: true },
  kitchenEquipment: { type: String },
  chef: { type: String, required: true },
  tags: { type: String, required: true },
  reviews: { type: String, required: true },
});

module.exports = mongoose.model("Recipe", recipeSchema);
