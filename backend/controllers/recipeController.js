const Recipe = require("../models/Recipe");

// Custom error class for handling specific API errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Set status based on status code (4xx = fail, 5xx = error)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Flag for operational errors (vs programming errors)
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper function to wrap async functions and catch errors
// This avoids writing try-catch blocks in every controller function
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Run the async function and catch any promise rejections
    fn(req, res, next).catch((err) => next(err)); // Pass errors to the global error handler
  };
};

// ===== RECIPE CONTROLLERS =====

// GET /api/recipes
// Retrieves all recipes with pagination
const getAllRecipes = catchAsync(async (req, res, next) => {
  // Get page and limit from query string, with defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get total number of recipes for pagination info
  const total = await Recipe.countDocuments();

  // Find recipes, sort by newest, skip for page, limit results
  const recipes = await Recipe.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // .lean() returns plain JS objects instead of Mongoose documents

  // Send success response with recipes and pagination details
  res.status(200).json({
    status: "success",
    results: recipes.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit), // Calculate total pages
      limit,
    },
    data: recipes,
  });
});

// GET /api/recipes/search
// Searches recipes by query string with pagination
const searchRecipes = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Check if search query is provided
  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  // Build the search query
  // Use MongoDB text search if query is long enough, otherwise use regex
  let searchQuery;
  if (query.length >= 3) {
    searchQuery = { $text: { $search: query } };
  } else {
    // Regex search across multiple fields (case-insensitive)
    searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { ingredients: { $regex: query, $options: "i" } },
      ],
    };
  }

  // Get total count of matching recipes for pagination
  const total = await Recipe.countDocuments(searchQuery);

  // Find matching recipes with pagination
  const recipes = await Recipe.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Send success response with search results and pagination
  res.status(200).json({
    status: "success",
    results: recipes.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: recipes,
  });
});

// GET /api/recipes/:id
// Retrieves a single recipe by its ID
const getRecipeById = catchAsync(async (req, res, next) => {
  // Validate the ID format (should be a MongoDB ObjectId)
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new AppError(`Invalid recipe ID format: ${req.params.id}`, 400)
    );
  }

  // Find the recipe by ID
  const recipe = await Recipe.findById(req.params.id).lean();

  // If recipe not found, send 404 error
  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Send success response with the recipe data
  res.status(200).json({
    status: "success",
    data: recipe,
  });
});

// POST /api/recipes
// Creates a new recipe
const createRecipe = catchAsync(async (req, res, next) => {
  // Extract data from request body
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

  // Prepare data for database insertion (basic type checking)
  const recipeData = {
    name: typeof name === "string" ? name : "",
    ingredients: Array.isArray(ingredients)
      ? ingredients.filter((i) => typeof i === "string")
      : [],
    instructions: Array.isArray(instructions)
      ? instructions.filter((i) => typeof i === "string")
      : [],
    time: typeof time === "number" ? time : parseInt(time) || 0,
    difficulty: typeof difficulty === "string" ? difficulty : "Medium",
    category: typeof category === "string" ? category : "",
    cookingMethod: typeof cookingMethod === "string" ? cookingMethod : "",
    kitchenEquipment: Array.isArray(kitchenEquipment)
      ? kitchenEquipment.filter((e) => typeof e === "string")
      : [],
    chef: typeof chef === "string" ? chef : "",
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [],
    reviews: Array.isArray(reviews)
      ? reviews.filter((r) => typeof r === "string")
      : [],
  };

  // Create the new recipe in the database
  // Mongoose schema handles timestamps (`createdAt`, `updatedAt`) automatically
  const newRecipe = await Recipe.create(recipeData);

  // Send success response (201 Created) with the new recipe data
  res.status(201).json({
    status: "success",
    data: newRecipe, // Send back the created recipe
  });
});

// PUT /api/recipes/:id
// Updates an existing recipe by its ID
const updateRecipe = catchAsync(async (req, res, next) => {
  // Validate the ID format
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new AppError(`Invalid recipe ID format: ${req.params.id}`, 400)
    );
  }

  // Find the recipe by ID and update it with the request body
  // Mongoose handles the `updatedAt` timestamp automatically
  const updatedRecipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    req.body, // Pass the entire request body for update
    {
      new: true, // Return the updated document instead of the old one
      runValidators: true, // Run schema validators during update
    }
  ).lean();

  // If recipe not found, send 404 error
  if (!updatedRecipe) {
    return next(
      new AppError(`Recipe not found with ID: ${req.params.id}`, 404)
    );
  }

  // Send success response with the updated recipe data
  res.status(200).json({
    status: "success",
    data: updatedRecipe,
  });
});

// DELETE /api/recipes/:id
// Deletes a recipe by its ID
const deleteRecipe = catchAsync(async (req, res, next) => {
  // Validate the ID format
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(
      new AppError(`Invalid recipe ID format: ${req.params.id}`, 400)
    );
  }

  // Find the recipe by ID and delete it
  const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);

  // If recipe not found, send 404 error
  if (!deletedRecipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Send success response (204 No Content is also common for deletes)
  res.status(200).json({
    status: "success",
    message: "Recipe deleted successfully",
  });
});

// Export all controller functions
module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
};
