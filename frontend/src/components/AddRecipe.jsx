import React, { useState } from "react";
import axios from "axios";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    name: "",
    ingredients: "",
    instructions: "",
    time: "",
    difficulty: "",
    category: "",
    cookingMethod: "",
    kitchenEquipment: "",
    chef: "",
    tags: "",
    reviews: "",
  });

  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/recipes",
        formData
      );
      setMessage("Recipe added successfully!");
      // Fetch updated list of recipes
      const recipesResponse = await axios.get(
        "http://localhost:5000/api/recipes"
      );
      setRecipes(recipesResponse.data);
      // Reset form
      setFormData({
        name: "",
        ingredients: "",
        instructions: "",
        time: "",
        difficulty: "",
        category: "",
        cookingMethod: "",
        kitchenEquipment: "",
        chef: "",
        tags: "",
        reviews: "",
      });
    } catch (error) {
      setMessage("Error adding recipe: " + error.message);
    }
  };

  return (
    <div className="add-recipe-container">
      <h2>Add New Recipe</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ingredients:</label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Instructions:</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Time:</label>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Difficulty:</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cooking Method:</label>
          <input
            type="text"
            name="cookingMethod"
            value={formData.cookingMethod}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Kitchen Equipment:</label>
          <input
            type="text"
            name="kitchenEquipment"
            value={formData.kitchenEquipment}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Chef:</label>
          <input
            type="text"
            name="chef"
            value={formData.chef}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Tags:</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Reviews:</label>
          <input
            type="text"
            name="reviews"
            value={formData.reviews}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Recipe
        </button>
      </form>

      <div className="recipes-list">
        <h3>Recent Recipes</h3>
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h4>{recipe.name}</h4>
            <p>
              <strong>Category:</strong> {recipe.category}
            </p>
            <p>
              <strong>Difficulty:</strong> {recipe.difficulty}
            </p>
            <p>
              <strong>Time:</strong> {recipe.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddRecipe;
