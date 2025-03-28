const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true }, // Optional field for chef's specialty
});

module.exports = mongoose.model("Chef", chefSchema);
