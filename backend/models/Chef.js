const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
});

module.exports = mongoose.model("Chef", chefSchema);
