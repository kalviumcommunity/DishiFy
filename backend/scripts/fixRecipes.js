const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { ObjectId } = mongoose.Types;
require('dotenv').config();

// Connect to MongoDB and run the cleanup
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for recipe fix');
    try {
      await fixRecipes();
    } catch (err) {
      console.error('Error in fix process:', err);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixRecipes() {
  try {
    console.log('Starting recipe fix...');
    
    // Get all recipes directly from the MongoDB collection to bypass Mongoose validation
    const collection = mongoose.connection.db.collection('recipes');
    const recipes = await collection.find({}).toArray();
    console.log(`Found ${recipes.length} recipes to process`);
    
    let replacedCount = 0;
    
    // Process each recipe
    for (const recipe of recipes) {
      let needsReplacement = false;
      
      // Check for ID format issues
      if (typeof recipe._id === 'string') {
        console.log(`Recipe ${recipe.name}: ID is a string "${recipe._id}" - needs replacement`);
        needsReplacement = true;
      }
      
      // Check for ID references in string fields
      if (typeof recipe.category === 'string' && recipe.category.match(/^[0-9a-fA-F]{24}$/)) {
        needsReplacement = true;
      }
      
      if (typeof recipe.chef === 'string' && recipe.chef.match(/^[0-9a-fA-F]{24}$/)) {
        needsReplacement = true;
      }
      
      if (typeof recipe.cookingMethod === 'string' && recipe.cookingMethod.match(/^[0-9a-fA-F]{24}$/)) {
        needsReplacement = true;
      }
      
      // Check arrays for ID references
      if (Array.isArray(recipe.ingredients)) {
        const hasIdReferences = recipe.ingredients.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          needsReplacement = true;
        }
      }
      
      if (Array.isArray(recipe.instructions)) {
        const hasIdReferences = recipe.instructions.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          needsReplacement = true;
        }
      }
      
      if (Array.isArray(recipe.tags)) {
        const hasIdReferences = recipe.tags.some(item => 
          typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/));
        
        if (hasIdReferences) {
          needsReplacement = true;
        }
      }
      
      // Replace the entire recipe if issues found
      if (needsReplacement) {
        console.log(`Replacing recipe: ${recipe.name}`);
        
        // Create a new recipe object with fixed data
        const newRecipe = {
          name: recipe.name,
          ingredients: Array.isArray(recipe.ingredients) && !recipe.ingredients.some(item => 
            typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/))
            ? recipe.ingredients 
            : ['Add ingredients here'],
          instructions: Array.isArray(recipe.instructions) && !recipe.instructions.some(item => 
            typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/))
            ? recipe.instructions 
            : ['Add cooking instructions here'],
          time: typeof recipe.time === 'number' ? recipe.time : 30,
          difficulty: ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) 
            ? recipe.difficulty 
            : 'Medium',
          category: typeof recipe.category === 'string' && !recipe.category.match(/^[0-9a-fA-F]{24}$/) 
            ? recipe.category 
            : 'Not specified',
          cookingMethod: typeof recipe.cookingMethod === 'string' && !recipe.cookingMethod.match(/^[0-9a-fA-F]{24}$/) 
            ? recipe.cookingMethod 
            : 'Not specified',
          kitchenEquipment: Array.isArray(recipe.kitchenEquipment) && !recipe.kitchenEquipment.some(item => 
            typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/))
            ? recipe.kitchenEquipment 
            : [],
          chef: typeof recipe.chef === 'string' && !recipe.chef.match(/^[0-9a-fA-F]{24}$/) 
            ? recipe.chef 
            : 'Not specified',
          tags: Array.isArray(recipe.tags) && !recipe.tags.some(item => 
            typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/))
            ? recipe.tags 
            : ['recipe', 'food'],
          reviews: Array.isArray(recipe.reviews) && !recipe.reviews.some(item => 
            typeof item === 'string' && item.match(/^[0-9a-fA-F]{24}$/))
            ? recipe.reviews 
            : [],
          createdAt: recipe.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        // Delete the old recipe
        try {
          if (typeof recipe._id === 'string') {
            // For string IDs, we need to convert to ObjectId or use the string directly
            const oldId = recipe._id.match(/^[0-9a-fA-F]{24}$/) 
              ? new ObjectId(recipe._id) 
              : recipe._id;
              
            await collection.deleteOne({ _id: oldId });
          } else {
            await collection.deleteOne({ _id: recipe._id });
          }
          
          // Insert the new recipe
          const result = await collection.insertOne(newRecipe);
          console.log(`Replaced recipe "${recipe.name}" with new ID: ${result.insertedId}`);
          replacedCount++;
        } catch (error) {
          console.error(`Failed to replace recipe ${recipe.name}:`, error);
        }
      }
    }
    
    console.log(`Recipe fix completed. Replaced ${replacedCount} out of ${recipes.length} recipes.`);
    
  } catch (error) {
    console.error('Error fixing recipes:', error);
    throw error; // Re-throw to be caught by the outer try-catch
  }
} 