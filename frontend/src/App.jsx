import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import './app.css';


function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all recipes when the component loads
    fetchRecipes();
  }, []);

  // Fetch all recipes from the backend
  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recipes');
      console.log('Fetched Recipes:', response.data);  // <-- Debugging log
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes: ', error);
    }
  };

  // Search for recipes by type or name
  const searchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recipes', { params: { type: searchTerm } });
      console.log('Search Results:', response.data);  // <-- Debugging log
      setRecipes(response.data);
    } catch (error) {
      console.error('Error searching recipes: ', error);
    }
  };

  return (
    <div>
      <h1>Food Recipes</h1>
      <input
        type="text"
        placeholder="Search for a type of food"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={searchRecipes}>Search</button>
      <ul>
  {recipes.map(recipe => (
    <li key={recipe._id}>
      <h2>{recipe.name}</h2>
      <p>{recipe.instructions}</p>
      <h4>Ingredients:</h4>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        <ul>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      ) : (
        <p>No ingredients available</p>
      )}
    </li>
  ))}
</ul>

    </div>
  );
}

export default App;
