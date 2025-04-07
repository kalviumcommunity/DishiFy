import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import AddRecipe from "./components/AddRecipe";
import "./components/AddRecipe.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch all recipes from the backend
  const fetchRecipes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/recipes");
      setRecipes(response.data);
    } catch (error) {
      setError("Error fetching recipes. Please try again.");
      console.error("Error fetching recipes: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Search for recipes
  const searchRecipes = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchRecipes();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:5000/api/recipes/search", {
        params: { query: searchTerm }
      });
      
      if (response.data.length === 0) {
        setError("No recipes found matching your search.");
      }
      setRecipes(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No recipes found matching your search.");
      } else {
        setError("Error searching recipes. Please try again.");
      }
      console.error("Error searching recipes: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Food Recipes</h1>
        <form onSubmit={searchRecipes} className="search-container">
          <input
            type="text"
            placeholder="Search by name, category, or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
          <button type="button" onClick={fetchRecipes}>Clear Search</button>
        </form>
      </header>

      <main>
        <AddRecipe />
        
        {loading && <p className="loading">Loading recipes...</p>}
        {error && <p className="error">{error}</p>}
        
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <h2>{recipe.name}</h2>
              <div className="recipe-details">
                <p><strong>Category:</strong> {recipe.category}</p>
                <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
                <p><strong>Time:</strong> {recipe.time}</p>
                <p><strong>Cooking Method:</strong> {recipe.cookingMethod}</p>
                <p><strong>Chef:</strong> {recipe.chef}</p>
                <p><strong>Tags:</strong> {recipe.tags}</p>
              </div>
              <div className="recipe-content">
                <h4>Ingredients:</h4>
                <p>{recipe.ingredients}</p>
                <h4>Instructions:</h4>
                <p>{recipe.instructions}</p>
                <h4>Kitchen Equipment:</h4>
                <p>{recipe.kitchenEquipment}</p>
                <h4>Reviews:</h4>
                <p>{recipe.reviews}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
