import { useState } from "react";

const dummyRecipes = {
  "Pasta": {
    name: "Creamy Alfredo Pasta",
    ingredients: ["Pasta", "Heavy Cream", "Garlic", "Parmesan Cheese", "Butter"],
    steps: [
      "Boil pasta until al dente.",
      "In a pan, melt butter and sauté garlic.",
      "Add heavy cream and let it simmer.",
      "Mix in Parmesan cheese until smooth.",
      "Toss pasta with sauce and serve."
    ]
  },
  "Pizza": {
    name: "Margherita Pizza",
    ingredients: ["Pizza Dough", "Tomato Sauce", "Mozzarella Cheese", "Basil", "Olive Oil"],
    steps: [
      "Preheat oven to 475°F (245°C).",
      "Roll out the pizza dough and spread tomato sauce.",
      "Add mozzarella cheese and fresh basil leaves.",
      "Drizzle olive oil on top and bake for 10-12 minutes.",
      "Slice and enjoy!"
    ]
  }
};

export default function RecipeCard() {
  const [search, setSearch] = useState("");
  const [recipe, setRecipe] = useState(null);

  const handleSearch = () => {
    const foundRecipe = dummyRecipes[search];
    setRecipe(foundRecipe || null);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Recipe Search</h2>
      <input
        type="text"
        placeholder="Search for a recipe..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button onClick={handleSearch} style={{ padding: "10px 20px", cursor: "pointer" }}>Search</button>
      {recipe && (
        <div style={{ border: "1px solid #ddd", padding: "20px", marginTop: "20px" }}>
          <h2>{recipe.name}</h2>
          <h3>Ingredients:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h3>Steps:</h3>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
