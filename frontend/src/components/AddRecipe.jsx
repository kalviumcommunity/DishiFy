import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRecipe.css";

function AddRecipe({ onRecipeAdded }) {
  const navigate = useNavigate();
  
  // State to store all form data
  const [recipe, setRecipe] = useState({
    name: "",
    category: "",
    difficulty: "Medium",
    time: "",
    cookingMethod: "",
    chef: "",
    tags: "",
    ingredients: "",
    instructions: "",
    kitchenEquipment: "",
    reviews: ""
  });
  
  // State for showing messages
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    // Get the field name and value from the event
    const { name, value } = e.target;
    
    // Update the recipe state with the new value
    setRecipe({
      ...recipe, // Keep all other values the same
      [name]: value // Update only the field that changed
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    
    // Check if required fields are filled
    if (!recipe.name || !recipe.category || !recipe.time || 
        !recipe.cookingMethod || !recipe.chef || !recipe.ingredients || 
        !recipe.instructions) {
      setMessage("Please fill all required fields");
      setIsError(true);
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage("");
      setIsError(false);
      
      // Prepare the data to send to the server
      const recipeData = {
        name: recipe.name.trim(),
        category: recipe.category.trim(),
        time: Number(recipe.time), // Convert string to number
        difficulty: recipe.difficulty,
        cookingMethod: recipe.cookingMethod.trim(),
        chef: recipe.chef.trim(),
        // Convert comma-separated string to array 
        tags: recipe.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Convert newline-separated strings to arrays
        ingredients: recipe.ingredients.split('\n').map(item => item.trim()).filter(item => item),
        instructions: recipe.instructions.split('\n').map(item => item.trim()).filter(item => item),
        kitchenEquipment: recipe.kitchenEquipment.split('\n').map(item => item.trim()).filter(item => item),
        reviews: recipe.reviews.split('\n').map(item => item.trim()).filter(item => item)
      };
      
      // Send the data to the server
      const response = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error adding recipe");
      }

      // Show success message
      setMessage("Recipe added successfully!");
      setIsError(false);
      
      // Reset form
      setRecipe({
        name: "",
        category: "",
        difficulty: "Medium",
        time: "",
        cookingMethod: "",
        chef: "",
        tags: "",
        ingredients: "",
        instructions: "",
        kitchenEquipment: "",
        reviews: ""
      });
      
      // Refresh recipe list
      if (onRecipeAdded) {
        onRecipeAdded();
      }
      
      // Go back to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      setMessage(error.message || "Failed to add recipe");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-recipe-container">
      <h2>Add New Recipe</h2>
      
      {/* Show message if there is one */}
      {message && (
        <div className={isError ? "error" : "success"}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Recipe Name */}
        <div className="form-group">
          <label htmlFor="name">Recipe Name: *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category: *</label>
          <input
            type="text"
            id="category"
            name="category"
            value={recipe.category}
            onChange={handleChange}
            required
            placeholder="e.g., Dessert, Main Course, etc."
          />
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={recipe.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Cooking Time */}
        <div className="form-group">
          <label htmlFor="time">Cooking Time (minutes): *</label>
          <input
            type="number"
            id="time"
            name="time"
            value={recipe.time}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 30"
          />
        </div>

        {/* Cooking Method */}
        <div className="form-group">
          <label htmlFor="cookingMethod">Cooking Method: *</label>
          <input
            type="text"
            id="cookingMethod"
            name="cookingMethod"
            value={recipe.cookingMethod}
            onChange={handleChange}
            required
            placeholder="e.g., Baking, Frying, etc."
          />
        </div>

        {/* Chef */}
        <div className="form-group">
          <label htmlFor="chef">Chef: *</label>
          <input
            type="text"
            id="chef"
            name="chef"
            value={recipe.chef}
            onChange={handleChange}
            required
            placeholder="Your name or the recipe creator"
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags: (separate with commas)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={recipe.tags}
            onChange={handleChange}
            placeholder="e.g., healthy, vegan, quick"
          />
        </div>

        {/* Ingredients */}
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients: * (one per line)</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            required
            rows="5"
            placeholder="e.g., 2 eggs&#10;1 cup flour&#10;1/2 cup sugar"
          ></textarea>
        </div>

        {/* Instructions */}
        <div className="form-group">
          <label htmlFor="instructions">Instructions: * (one per line)</label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            required
            rows="5"
            placeholder="e.g., Preheat oven to 350F&#10;Mix all ingredients&#10;Bake for 25 minutes"
          ></textarea>
        </div>

        {/* Kitchen Equipment */}
        <div className="form-group">
          <label htmlFor="kitchenEquipment">Kitchen Equipment: (one per line)</label>
          <textarea
            id="kitchenEquipment"
            name="kitchenEquipment"
            value={recipe.kitchenEquipment}
            onChange={handleChange}
            rows="3"
            placeholder="e.g., Mixing bowl&#10;Whisk&#10;Baking tray"
          ></textarea>
        </div>

        {/* Reviews */}
        <div className="form-group">
          <label htmlFor="reviews">Reviews: (one per line)</label>
          <textarea
            id="reviews"
            name="reviews"
            value={recipe.reviews}
            onChange={handleChange}
            rows="3"
            placeholder="e.g., Great recipe!&#10;Family loved it&#10;Will make again"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Adding Recipe..." : "Add Recipe"}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate("/")}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipe;
