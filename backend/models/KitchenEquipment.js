const mongoose = require("mongoose");

const kitchenEquipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model("KitchenEquipment", kitchenEquipmentSchema);
