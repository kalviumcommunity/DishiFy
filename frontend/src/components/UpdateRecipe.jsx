import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddRecipe.css";

const UpdateRecipe = ({ onRecipeUpdated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for storing recipe data
  const [recipe, setRecipe] = useState({
    name: "",
    ingredients: [],
    instructions: [],
    time: "",
    difficulty: "",
    category: "",
    cookingMethod: "",
    kitchenEquipment: [],
    chef: "",
    tags: [],
    reviews: []
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Fetch recipe data when component loads
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Check if ID is valid
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error(`Invalid recipe ID: ${id}`);
        }
        
        // Fetch recipe from API
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Get recipe data from response
        const recipeData = data.data || data;
        
        // Convert arrays to strings for form inputs
        setRecipe({
          ...recipeData,
          ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
          instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
          kitchenEquipment: Array.isArray(recipeData.kitchenEquipment) ? recipeData.kitchenEquipment : [],
          tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
          reviews: Array.isArray(recipeData.reviews) ? recipeData.reviews : []
        });
        
        setLoading(false);
      } catch (error) {
        setMessage(error.message || 'Failed to fetch recipe');
        setIsError(true);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ingredients' || name === 'instructions' || 
        name === 'kitchenEquipment' || name === 'tags' || 
        name === 'reviews') {
      // Convert text with line breaks to array
      const arrayValue = value.split('\n').filter(item => item.trim());
      
      setRecipe({
        ...recipe, 
        [name]: arrayValue
      });
    } else if (name === 'time') {
      // Convert time to number
      const timeValue = value === '' ? '' : parseInt(value);
      
      setRecipe({
        ...recipe,
        time: timeValue
      });
    } else {
      setRecipe({
        ...recipe,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);
      
      // Prepare data for submission
      const recipeData = {
        ...recipe,
        time: typeof recipe.time === 'string' ? parseInt(recipe.time) : recipe.time
      };
      
      // Send update request to API
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Show success message
      setMessage("Recipe updated successfully!");
      setIsError(false);
      
      // Call update callback
      if (onRecipeUpdated) {
        onRecipeUpdated();
      }
      
      // Navigate back to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'Failed to update recipe');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !recipe.name) {
    return <div className="loading">Loading recipe data...</div>;
  }

  return (
    <div className="add-recipe-container">
      <h2>Update Recipe</h2>
      
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
            value={recipe.category || ""}
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
            value={recipe.difficulty || "Medium"}
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
            value={recipe.time || ""}
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
            value={recipe.cookingMethod || ""}
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
            value={recipe.chef || ""}
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
            value={Array.isArray(recipe.tags) ? recipe.tags.join(", ") : ""}
            onChange={(e) => setRecipe({...recipe, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)})}
            placeholder="e.g., healthy, vegan, quick"
          />
        </div>

        {/* Ingredients */}
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients: * (one per line)</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={Array.isArray(recipe.ingredients) ? recipe.ingredients.join("\n") : ""}
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
            value={Array.isArray(recipe.instructions) ? recipe.instructions.join("\n") : ""}
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
            value={Array.isArray(recipe.kitchenEquipment) ? recipe.kitchenEquipment.join("\n") : ""}
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
            value={Array.isArray(recipe.reviews) ? recipe.reviews.join("\n") : ""}
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
            disabled={loading}
          >
            {loading ? "Updating Recipe..." : "Update Recipe"}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateRecipe; 