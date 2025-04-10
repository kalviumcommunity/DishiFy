const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Recipe name is required"], 
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  ingredients: { 
    type: [String], 
    required: [true, "Ingredients are required"],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: "At least one ingredient is required"
    }
  },
  instructions: { 
    type: [String], 
    required: [true, "Instructions are required"],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: "At least one instruction step is required"
    }
  },
  time: { 
    type: Number, 
    required: [true, "Cooking time is required"],
    min: [1, "Cooking time must be at least 1 minute"],
    max: [1440, "Cooking time cannot exceed 24 hours (1440 minutes)"]
  },
  difficulty: { 
    type: String, 
    required: [true, "Difficulty level is required"],
    enum: {
      values: ["Easy", "Medium", "Hard"],
      message: "Difficulty must be Easy, Medium, or Hard"
    }
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    trim: true
  },
  cookingMethod: { 
    type: String, 
    required: [true, "Cooking method is required"],
    trim: true
  },
  kitchenEquipment: { 
    type: [String],
    default: []
  },
  chef: { 
    type: String, 
    required: [true, "Chef name is required"],
    trim: true
  },
  tags: { 
    type: [String], 
    required: [true, "Tags are required"],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: "At least one tag is required"
    }
  },
  reviews: { 
    type: [String],
    default: []
  }
}, {
  timestamps: true, // This will automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add middleware to ensure all data is properly formatted before saving
recipeSchema.pre('save', function(next) {
  // Convert any ObjectId references to strings
  if (this.category && this.category.toString().match(/^[0-9a-fA-F]{24}$/)) {
    this.category = 'Not specified';
  }
  
  if (this.chef && this.chef.toString().match(/^[0-9a-fA-F]{24}$/)) {
    this.chef = 'Not specified';
  }
  
  if (this.cookingMethod && this.cookingMethod.toString().match(/^[0-9a-fA-F]{24}$/)) {
    this.cookingMethod = 'Not specified';
  }
  
  // Clean arrays to remove any ObjectId references
  if (Array.isArray(this.ingredients)) {
    this.ingredients = this.ingredients
      .filter(item => typeof item === 'string' && !item.match(/^[0-9a-fA-F]{24}$/));
  }
  
  if (Array.isArray(this.instructions)) {
    this.instructions = this.instructions
      .filter(item => typeof item === 'string' && !item.match(/^[0-9a-fA-F]{24}$/));
  }
  
  if (Array.isArray(this.kitchenEquipment)) {
    this.kitchenEquipment = this.kitchenEquipment
      .filter(item => typeof item === 'string' && !item.match(/^[0-9a-fA-F]{24}$/));
  }
  
  if (Array.isArray(this.tags)) {
    this.tags = this.tags
      .filter(item => typeof item === 'string' && !item.match(/^[0-9a-fA-F]{24}$/));
  }
  
  if (Array.isArray(this.reviews)) {
    this.reviews = this.reviews
      .filter(item => typeof item === 'string' && !item.match(/^[0-9a-fA-F]{24}$/));
  }
  
  next();
});

// Add a virtual property for average cooking time
recipeSchema.virtual('cookingTimeDisplay').get(function() {
  if (this.time < 60) {
    return `${this.time} minutes`;
  } else {
    const hours = Math.floor(this.time / 60);
    const minutes = this.time % 60;
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
});

// Index for faster searches
recipeSchema.index({ name: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model("Recipe", recipeSchema);
