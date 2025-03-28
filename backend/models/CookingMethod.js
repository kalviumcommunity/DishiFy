const mongoose = require("mongoose");

const cookingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  recipes: [{ type: String }], // Change to store recipe names as strings
});

module.exports = mongoose.model("CookingMethod", cookingMethodSchema);
