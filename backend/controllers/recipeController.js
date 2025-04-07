const Recipe = require("../models/Recipe");

// Get all recipes
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().lean();
    res.status(200).json(recipes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching recipes", error: error.message });
  }
};

// Search recipes
const searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const recipes = await Recipe.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { ingredients: { $regex: query, $options: "i" } },
      ],
    }).lean();

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No recipes found matching your search" });
    }

    res.status(200).json(recipes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching recipes", error: error.message });
  }
};

// Get a recipe by ID
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching recipe", error: error.message });
  }
};

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const {
      name,
      ingredients,
      instructions,
      time,
      difficulty,
      category,
      cookingMethod,
      kitchenEquipment,
      chef,
      tags,
      reviews,
    } = req.body;

    // Ensure all required fields are provided
    if (
      !name ||
      !ingredients ||
      !instructions ||
      !time ||
      !difficulty ||
      !category ||
      !cookingMethod ||
      !chef ||
      !tags ||
      !reviews
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      time,
      difficulty,
      category,
      cookingMethod,
      kitchenEquipment,
      chef,
      tags,
      reviews,
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating recipe", error: error.message });
  }
};

// Update an existing recipe
const updateRecipe = async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).lean();
    if (!updatedRecipe)
      return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating recipe", error: error.message });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe)
      return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting recipe", error: error.message });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
};
