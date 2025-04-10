const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
require('dotenv').config();

// Connect to MongoDB and run the cleanup
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for data cleanup');
    try {
      await cleanRecipeData();
    } catch (err) {
      console.error('Error in cleanup process:', err);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function cleanRecipeData() {
  try {
    console.log('Starting recipe data cleanup...');
    
    // Get all recipes directly from the MongoDB collection to bypass Mongoose validation
    const collection = mongoose.connection.db.collection('recipes');
    const recipes = await collection.find({}).toArray();
    console.log(`Found ${recipes.length} recipes to clean`);
    
    let updatedCount = 0;
    
    // Process each recipe
    for (const recipe of recipes) {
      let needsUpdate = false;
      const updates = {};
      
      // Check for ID references in string fields
      if (typeof recipe.category === 'string' && recipe.category.match(/^[0-9a-fA-F]{24}$/)) {
        updates.category = 'Not specified';
        needsUpdate = true;
      }
      
      if (typeof recipe.chef === 'string' && recipe.chef.match(/^[0-9a-fA-F]{24}$/)) {
        updates.chef = 'Not specified';
        needsUpdate = true;
      }
      
      if (typeof recipe.cookingMethod === 'string' && recipe.cookingMethod.match(/^[0-9a-fA-F]{24}$/)) {
        updates.cookingMethod = 'Not specified';
        needsUpdate = true;
      } else if (!recipe.cookingMethod) {
        updates.cookingMethod = 'Not specified';
        needsUpdate = true;
      }
      
      // Fix time field if it's a string
      if (typeof recipe.time === 'string') {
        const timeValue = parseInt(recipe.time);
        if (!isNaN(timeValue)) {
          updates.time = timeValue;
        } else {
          // Try to extract number from strings like "45 minutes"
          const match = recipe.time.match(/(\d+)/);
          if (match) {
            updates.time = parseInt(match[1]);
          } else {
            updates.time = 30; // Default to 30 minutes if no number found
          }
        }
        needsUpdate = true;
      }
      
      // Clean arrays to remove ID references
      if (Array.isArray(recipe.ingredients)) {
        const cleanedIngredients = recipe.ingredients
          .filter(item => typeof item === 'string')
          .filter(item => !item.match(/^[0-9a-fA-F]{24}$/));
          
        if (cleanedIngredients.length !== recipe.ingredients.length) {
          updates.ingredients = cleanedIngredients.length > 0 ? 
            cleanedIngredients : ['Ingredient not specified'];
          needsUpdate = true;
        }
      } else if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
        updates.ingredients = ['Ingredient not specified'];
        needsUpdate = true;
      }
      
      if (Array.isArray(recipe.instructions)) {
        const cleanedInstructions = recipe.instructions
          .filter(item => typeof item === 'string')
          .filter(item => !item.match(/^[0-9a-fA-F]{24}$/));
          
        if (cleanedInstructions.length !== recipe.instructions.length) {
          updates.instructions = cleanedInstructions.length > 0 ? 
            cleanedInstructions : ['No instructions specified'];
          needsUpdate = true;
        }
      } else if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
        updates.instructions = ['No instructions specified'];
        needsUpdate = true;
      }
      
      if (Array.isArray(recipe.kitchenEquipment)) {
        const cleanedEquipment = recipe.kitchenEquipment
          .filter(item => typeof item === 'string')
          .filter(item => !item.match(/^[0-9a-fA-F]{24}$/));
          
        if (cleanedEquipment.length !== recipe.kitchenEquipment.length) {
          updates.kitchenEquipment = cleanedEquipment;
          needsUpdate = true;
        }
      } else if (!recipe.kitchenEquipment || !Array.isArray(recipe.kitchenEquipment)) {
        updates.kitchenEquipment = [];
        needsUpdate = true;
      }
      
      if (Array.isArray(recipe.tags)) {
        const cleanedTags = recipe.tags
          .filter(item => typeof item === 'string')
          .filter(item => !item.match(/^[0-9a-fA-F]{24}$/));
          
        if (cleanedTags.length !== recipe.tags.length) {
          updates.tags = cleanedTags.length > 0 ? 
            cleanedTags : ['No tags'];
          needsUpdate = true;
        }
      } else if (!recipe.tags || !Array.isArray(recipe.tags)) {
        updates.tags = ['No tags'];
        needsUpdate = true;
      }
      
      if (Array.isArray(recipe.reviews)) {
        const cleanedReviews = recipe.reviews
          .filter(item => typeof item === 'string')
          .filter(item => !item.match(/^[0-9a-fA-F]{24}$/));
          
        if (cleanedReviews.length !== recipe.reviews.length) {
          updates.reviews = cleanedReviews;
          needsUpdate = true;
        }
      } else if (!recipe.reviews || !Array.isArray(recipe.reviews)) {
        updates.reviews = [];
        needsUpdate = true;
      }
      
      // Set difficulty if missing
      if (!recipe.difficulty) {
        updates.difficulty = 'Medium';
        needsUpdate = true;
      }
      
      // Update the recipe if changes were made - directly through MongoDB to bypass validation
      if (needsUpdate) {
        await collection.updateOne(
          { _id: recipe._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`Updated recipe: ${recipe.name} (${recipe._id})`);
      }
    }
    
    console.log(`Data cleanup completed. Updated ${updatedCount} out of ${recipes.length} recipes.`);
    
  } catch (error) {
    console.error('Error cleaning recipe data:', error);
    throw error; // Re-throw to be caught by the outer try-catch
  }
} 