import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Extract recipes array depending on API response format
        const recipesArray = data.data || data;
        setRecipes(recipesArray);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div className="loading">Loading recipes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="recipe-list-debug">
      <h2>All Recipes with IDs</h2>
      <p>This page shows all recipes with their IDs for debugging purposes.</p>
      
      <table className="debug-table">
        <thead>
          <tr>
            <th>Recipe Name</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map(recipe => (
            <tr key={recipe._id}>
              <td>{recipe.name}</td>
              <td>
                <code>{recipe._id}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(recipe._id)}
                  className="copy-button"
                >
                  Copy ID
                </button>
              </td>
              <td>
                <Link to={`/update/${recipe._id}`}>Update</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="navigation-links">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default RecipeList; 