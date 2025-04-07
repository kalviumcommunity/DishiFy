const express = require("express");
const recipeController = require("./controllers/recipeController");
const userController = require("./controllers/userController");

const router = express.Router();

// Recipe Routes
router.get("/recipes", recipeController.getAllRecipes);
router.get("/recipes/search", recipeController.searchRecipes);
router.get("/recipes/:id", recipeController.getRecipeById);
router.post("/recipes", recipeController.createRecipe);
router.put("/recipes/:id", recipeController.updateRecipe);
router.delete("/recipes/:id", recipeController.deleteRecipe);

// User Routes
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
