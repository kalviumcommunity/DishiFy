import React, { useState, useEffect } from "react";

const RecipeForm = () => {
  const [recipeName, setRecipeName] = useState("");
  const [recipes, setRecipes] = useState([]);

  // Fetch existing recipes on page load
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes"); // Replace with your API endpoint
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing

    const newRecipe = { name: recipeName };

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
      });

      if (response.ok) {
        setRecipeName(""); // Clear the form after submission
        fetchRecipes(); // Fetch the updated list of recipes
      } else {
        console.error("Failed to add recipe.");
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  return (
    <div>
      <h1>Add a New Recipe</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="Recipe Name"
          required
        />
        <button type="submit">Add Recipe</button>
      </form>

      <h2>Recipe List</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>{recipe.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeForm;
