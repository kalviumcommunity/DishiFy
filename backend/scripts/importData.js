const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Ensure dotenv is loaded correctly
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

// Import data
const recipes = require("../data/recipes.json");
const ingredients = require("../data/ingredients.json");
const users = require("../data/users.json");
const categories = require("../data/categories.json");
const reviews = require("../data/reviews.json");
const tags = require("../data/tags.json");
const chefs = require("../data/chefs.json");
const shoppingLists = require("../data/shoppingLists.json");
const kitchenEquipment = require("../data/kitchenEquipment.json");
const cookingMethods = require("../data/cookingMethods.json");

// Set up Express server (if needed)
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure MongoDB URI is correctly loaded
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Mongo URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI); // Options removed as they're no longer needed
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit if connection fails
  }
};

// Import data function
const importData = async () => {
  try {
    // Check with the user before clearing data
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Are you sure you want to clear all data and re-import? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes") {
          console.log("Clearing existing data...");

          // Clear previous data if collections are not empty
          if (await Recipe.countDocuments()) await Recipe.deleteMany();
          if (await Ingredient.countDocuments()) await Ingredient.deleteMany();
          if (await User.countDocuments()) await User.deleteMany();
          if (await Category.countDocuments()) await Category.deleteMany();
          if (await Review.countDocuments()) await Review.deleteMany();
          if (await Tag.countDocuments()) await Tag.deleteMany();
          if (await Chef.countDocuments()) await Chef.deleteMany();
          if (await ShoppingList.countDocuments())
            await ShoppingList.deleteMany();
          if (await KitchenEquipment.countDocuments())
            await KitchenEquipment.deleteMany();
          if (await CookingMethod.countDocuments())
            await CookingMethod.deleteMany();

          console.log("Inserting new data...");

          // Insert new data with error handling per collection
          try {
            await Recipe.insertMany(recipes);
            console.log("Recipes imported successfully!");
          } catch (error) {
            console.error("Error importing recipes:", error);
          }

          try {
            await Ingredient.insertMany(ingredients);
            console.log("Ingredients imported successfully!");
          } catch (error) {
            console.error("Error importing ingredients:", error);
          }

          try {
            await User.insertMany(users);
            console.log("Users imported successfully!");
          } catch (error) {
            console.error("Error importing users:", error);
          }

          try {
            await Category.insertMany(categories);
            console.log("Categories imported successfully!");
          } catch (error) {
            console.error("Error importing categories:", error);
          }

          try {
            await Review.insertMany(reviews);
            console.log("Reviews imported successfully!");
          } catch (error) {
            console.error("Error importing reviews:", error);
          }

          try {
            await Tag.insertMany(tags);
            console.log("Tags imported successfully!");
          } catch (error) {
            console.error("Error importing tags:", error);
          }

          try {
            await Chef.insertMany(chefs);
            console.log("Chefs imported successfully!");
          } catch (error) {
            console.error("Error importing chefs:", error);
          }

          // --- Mapping for shopping lists ---
          // Fetch the freshly imported users and ingredients to map names to ObjectIds
          const usersFromDB = await User.find();
          const ingredientsFromDB = await Ingredient.find();

          const updatedShoppingLists = shoppingLists.map((list) => {
            const user = usersFromDB.find((u) => u.username === list.user);
            if (!user) throw new Error(`User ${list.user} not found`);

            // Use reduce to create an array of ObjectIds and skip missing ingredients.
            const mappedItems = list.items.reduce((acc, itemName) => {
              // Use case-insensitive match if needed
              const ingredient = ingredientsFromDB.find(
                (i) => i.name.toLowerCase() === itemName.toLowerCase()
              );
              if (!ingredient) {
                console.warn(
                  `Warning: Ingredient "${itemName}" not found. It will be skipped.`
                );
                return acc;
              }
              acc.push(ingredient._id);
              return acc;
            }, []);

            return {
              ...list,
              user: user._id,
              items: mappedItems,
            };
          });

          try {
            await ShoppingList.insertMany(updatedShoppingLists);
            console.log("Shopping lists imported successfully!");
          } catch (error) {
            console.error("Error importing shopping lists:", error);
          }

          try {
            await KitchenEquipment.insertMany(kitchenEquipment);
            console.log("Kitchen equipment imported successfully!");
          } catch (error) {
            console.error("Error importing kitchen equipment:", error);
          }

          try {
            await CookingMethod.insertMany(cookingMethods);
            console.log("Cooking methods imported successfully!");
          } catch (error) {
            console.error("Error importing cooking methods:", error);
          }

          console.log("Data successfully imported!");
          process.exit();
        } else {
          console.log("Data import aborted!");
          process.exit(); // Exit if the user declines
        }
      }
    );
  } catch (error) {
    console.error("Error during import process:", error);
    process.exit(1); // Exit with failure
  }
};

// Start server and import process
const startServer = async () => {
  // First, connect to MongoDB
  await connectDB();

  // Import the data after successful MongoDB connection
  await importData();

  // Start the Express server after data import
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Run the server and import process
startServer();
