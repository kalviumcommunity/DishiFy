const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
});

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
