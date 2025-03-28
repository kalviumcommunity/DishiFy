const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
    },
    comment: {
      type: String,
      trim: true, // Ensures no unnecessary spaces
    },
    user: {
      type: String, // Changed to String instead of ObjectId
      required: true, // User is required
    },
    recipe: {
      type: String, // Recipe is a String instead of ObjectId
      required: true, // Recipe is required
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Check if the model is already defined to avoid overwriting it
module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
