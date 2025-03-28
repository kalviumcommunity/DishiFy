const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [{ type: String }], // Store ingredient names as strings
  instructions: { type: String, required: true },
  time: { type: String, required: true },
  difficulty: { type: String, required: true },
  category: { type: String, required: true }, // Store category name as string
  chef: { type: String, required: true }, // Store chef name as string
  tags: [{ type: String, required: true }], // Store tag names as strings
  reviews: [{ type: String, required: true }], // Store review comments as strings
});

module.exports = mongoose.model("Recipe", recipeSchema);
