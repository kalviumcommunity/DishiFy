const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
  instructions: { type: String, required: true },
  time: { type: String },
  difficulty: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  chef: { type: mongoose.Schema.Types.ObjectId, ref: "Chef" },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Recipe", recipeSchema);
