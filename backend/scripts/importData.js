const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const readline = require("readline");

// Import models
const Recipe = require("../models/Recipe");
const Ingredient = require("../models/Ingredient");
const User = require("../models/User");
const Category = require("../models/Category");
const Review = require("../models/Review");
const Tag = require("../models/Tag");
const Chef = require("../models/Chef");
const ShoppingList = require("../models/ShoppingList");
const KitchenEquipment = require("../models/KitchenEquipment");
const CookingMethod = require("../models/CookingMethod");

// Import JSON data files
const categories = require("../data/categories.json");
const tags = require("../data/tags.json");
const chefs = require("../data/chefs.json");
const ingredients = require("../data/ingredients.json");
const users = require("../data/users.json");
const recipes = require("../data/recipes.json");
const reviews = require("../data/reviews.json");
const cookingMethods = require("../data/cookingMethods.json");
const shoppingLists = require("../data/shoppingLists.json");
const kitchenEquipment = require("../data/kitchenEquipment.json");

const app = express();
const PORT = 3000;
const MONGOURL = process.env.MONGO_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!MONGOURL) {
      throw new Error("Mongo URI is not defined in .env");
    }
    await mongoose.connect(MONGOURL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Wrapper to use readline with Promises
const askQuestion = (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Import data function
const importData = async () => {
  try {
    const answer = await askQuestion(
      "Are you sure you want to clear all data and re-import? (yes/no): "
    );

    if (answer.toLowerCase() === "yes") {
      console.log("Clearing existing data...");

      // Clear previous data
      await Recipe.deleteMany();
      await Ingredient.deleteMany();
      await User.deleteMany();
      await Category.deleteMany();
      await Review.deleteMany();
      await Tag.deleteMany();
      await Chef.deleteMany();
      await ShoppingList.deleteMany();
      await KitchenEquipment.deleteMany();
      await CookingMethod.deleteMany();

      console.log("Inserting new data...");

      // Insert categories, tags, chefs, and other related collections first
      const insertedCategories = await Category.insertMany(categories);
      const insertedTags = await Tag.insertMany(tags);
      const insertedChefs = await Chef.insertMany(chefs);

      console.log("Categories inserted:", insertedCategories);
      console.log("Tags inserted:", insertedTags);
      console.log("Chefs inserted:", insertedChefs);

      // Insert ingredients and map them by name
      const insertedIngredients = await Ingredient.insertMany(ingredients);
      const ingredientMap = insertedIngredients.reduce((acc, ingredient) => {
        acc[ingredient.name] = ingredient._id;
        return acc;
      }, {});

      // Fetch users and insert them
      const insertedUsers = await User.insertMany(users);
      const userMap = insertedUsers.reduce((acc, user) => {
        acc[user.username] = user._id;
        return acc;
      }, {});

      // Insert recipes after mapping ingredients, categories, tags, and chefs (using strings for categories, tags, and chefs)
      const updatedRecipes = recipes.map((recipe) => {
        return {
          ...recipe,
          ingredients: recipe.ingredients
            .map((ingredientName) => ingredientMap[ingredientName] || null)
            .filter(Boolean),
          category: recipe.category || null, // Directly using category string
          chef: recipe.chef || null, // Directly using chef string
          tags: recipe.tags
            .map((tagName) => tagName || null) // Directly using tag string
            .filter(Boolean),
        };
      });

      const insertedRecipes = await Recipe.insertMany(updatedRecipes);
      console.log("Recipes imported successfully!");

      // Handle reviews after mapping recipes and users (using strings for recipe and user references)
      const recipeMap = insertedRecipes.reduce((acc, recipe) => {
        acc[recipe.name] = recipe._id;
        return acc;
      }, {});

      const updatedReviews = reviews
        .map((review) => ({
          ...review,
          recipe: recipeMap[review.recipe] || null, // Map recipe by name
          user: userMap[review.user] || null, // Map user by username
        }))
        .filter((review) => review.user && review.recipe); // Filter out invalid reviews

      await Review.insertMany(updatedReviews);
      console.log("Reviews imported successfully!");

      // Insert cooking methods after mapping recipes (no ObjectId used here)
      const updatedCookingMethods = cookingMethods.map((method) => {
        return {
          ...method,
          recipes: method.recipes
            .map((recipeName) => recipeMap[recipeName] || null)
            .filter(Boolean),
        };
      });

      await CookingMethod.insertMany(updatedCookingMethods);
      console.log("Cooking Methods imported successfully!");

      // Insert shopping lists after mapping users and ingredients (no ObjectId used here either)
      const updatedShoppingLists = shoppingLists
        .map((list) => ({
          ...list,
          user: userMap[list.user], // Map user to _id
          items: list.items
            .map((ingredientName) => ingredientMap[ingredientName] || null)
            .filter(Boolean),
        }))
        .filter((list) => list.user); // Filter out invalid shopping lists

      await ShoppingList.insertMany(updatedShoppingLists);
      console.log("Shopping Lists imported successfully!");

      // Insert kitchen equipment after mapping recipes (no ObjectId used)
      const updatedKitchenEquipment = kitchenEquipment.map((equipment) => {
        return {
          ...equipment,
          recipes: equipment.recipes
            .map((recipeName) => recipeMap[recipeName] || null)
            .filter(Boolean),
        };
      });

      await KitchenEquipment.insertMany(updatedKitchenEquipment);
      console.log("Kitchen Equipment imported successfully!");

      console.log("Data successfully imported!");
      process.exit();
    } else {
      console.log("Data import aborted!");
      process.exit();
    }
  } catch (error) {
    console.error("Error during import process:", error);
    process.exit(1);
  }
};

// Start server and import process
const startServer = async () => {
  await connectDB();
  await importData();
};

// Run the server and import process
startServer();
