const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
require('dotenv').config();

// Connect to MongoDB and run the cleanup
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for data normalization');
    try {
      await normalizeIds();
    } catch (err) {
      console.error('Error in normalization process:', err);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function normalizeIds() {
  try {
    console.log('Starting recipe ID normalization...');
    
    // Get all recipes directly from the MongoDB collection to bypass Mongoose validation
    const collection = mongoose.connection.db.collection('recipes');
    const recipes = await collection.find({}).toArray();
    console.log(`Found ${recipes.length} recipes to process`);
    
    let updatedCount = 0;
    
    // Process each recipe
    for (const recipe of recipes) {
      let needsUpdate = false;
      const updates = {};
      
      // Process the recipe ID format
      if (recipe._id && typeof recipe._id === 'object' && recipe._id.toString) {
        console.log(`Recipe ${recipe.name}: ID is already an ObjectId`);
      } else if (typeof recipe._id === 'string') {
        console.log(`Recipe ${recipe.name}: ID is a string "${recipe._id}"`);
        // Can't update the _id directly, will need to create a new document
        needsUpdate = true;
      }
      
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
      }
      
      // Clean arrays to remove ID references
      if (Array.isArray(recipe.ingredients)) {
        const hasIdReferences = recipe.ingredients.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          updates.ingredients = ['Add your ingredients here'];
          needsUpdate = true;
        }
      }
      
      if (Array.isArray(recipe.instructions)) {
        const hasIdReferences = recipe.instructions.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          updates.instructions = ['Add cooking instructions here'];
          needsUpdate = true;
        }
      }
      
      if (Array.isArray(recipe.tags)) {
        const hasIdReferences = recipe.tags.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          updates.tags = ['recipe', 'food'];
          needsUpdate = true;
        }
      }
      
      // Update the recipe if changes were made
      if (needsUpdate) {
        await collection.updateOne(
          { _id: recipe._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`Updated recipe: ${recipe.name} (${recipe._id})`);
      }
    }
    
    console.log(`Data normalization completed. Updated ${updatedCount} out of ${recipes.length} recipes.`);
    
  } catch (error) {
    console.error('Error normalizing recipe data:', error);
    throw error; // Re-throw to be caught by the outer try-catch
  }
} 