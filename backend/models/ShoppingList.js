const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema({
  user: { type: String },
  items: [{ type: String }],
});

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
