import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AddRecipe from "./components/AddRecipe";
import ErrorBoundary from "./components/ErrorBoundary";
import { Helmet } from "react-helmet";
import UpdateRecipe from "./components/UpdateRecipe";
import RecipeList from "./components/RecipeList";

function App() {
  // State for storing recipes and UI states
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  });

  // Function to fetch recipes from the API
  const fetchRecipes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/recipes?page=${page}&limit=${pagination.limit}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setRecipes(result.data || []);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          pages: result.pagination.pages,
        });
      } else {
        throw new Error(result.message || "Failed to fetch recipes");
      }
    } catch (error) {
      setError(error.message || "Failed to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load recipes when component mounts
  useEffect(() => {
    fetchRecipes(1);
  }, []);

  // Function to search recipes
  const searchRecipes = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      fetchRecipes(1);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/recipes/search?query=${encodeURIComponent(
          searchTerm
        )}&page=1&limit=${pagination.limit}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setRecipes(result.data || []);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          pages: result.pagination.pages,
        });
      } else {
        throw new Error(result.message || "Failed to search recipes");
      }
    } catch (error) {
      setError(error.message || "Failed to search recipes. Please try again.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to change page
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;

    if (searchTerm.trim()) {
      // If we're searching, use the search endpoint with the new page
      fetchSearchResults(newPage);
    } else {
      // Otherwise, just fetch regular recipes with the new page
      fetchRecipes(newPage);
    }
  };

  // Function to fetch search results for a specific page
  const fetchSearchResults = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/recipes/search?query=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=${pagination.limit}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setRecipes(result.data || []);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          pages: result.pagination.pages,
        });
      } else {
        throw new Error(result.message || "Failed to search recipes");
      }
    } catch (error) {
      setError(error.message || "Failed to search recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchTerm("");
    fetchRecipes(1);
  };

  // Pagination component to navigate between pages
  const Pagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="pagination-button"
        >
          Previous
        </button>

        <span className="page-info">
          Page {pagination.page} of {pagination.pages}
        </span>

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  // Function to delete a recipe
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/recipes/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        // Refresh the recipes list
        fetchRecipes(1);
      } catch (error) {
        setError(error.message || "Failed to delete recipe");
      }
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <Helmet>
            <title>Recipe Book</title>
            <meta
              name="description"
              content="A collection of delicious recipes"
            />
          </Helmet>

          <header>
            <h1>Recipe Book</h1>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/add" className="add-button">
                Add Recipe
              </Link>
            </nav>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <div className="main-content">
                  <div className="search-container">
                    <form onSubmit={searchRecipes} className="search-form">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search recipes..."
                        className="search-input"
                      />
                      <button type="submit" className="search-button">
                        Search
                      </button>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="clear-button"
                        >
                          Clear
                        </button>
                      )}
                    </form>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  {loading ? (
                    <div className="loading">Loading recipes...</div>
                  ) : (
                    <>
                      <div className="recipes-list">
                        {recipes.length === 0 ? (
                          <div className="no-recipes">
                            {searchTerm
                              ? "No recipes match your search."
                              : "No recipes yet. Add your first recipe!"}
                          </div>
                        ) : (
                          recipes.map((recipe) => (
                            <article key={recipe._id} className="recipe-card">
                              <h3>{recipe.name}</h3>

                              <div className="recipe-details">
                                <div className="detail-row">
                                  <span>
                                    <strong>Category:</strong>{" "}
                                    {recipe.category || "Not specified"}
                                  </span>
                                  <span>
                                    <strong>Difficulty:</strong>{" "}
                                    {recipe.difficulty || "Not specified"}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span>
                                    <strong>Cooking Time:</strong>{" "}
                                    {recipe.time
                                      ? `${recipe.time} minutes`
                                      : "Not specified"}
                                  </span>
                                  <span>
                                    <strong>Method:</strong>{" "}
                                    {recipe.cookingMethod || "Not specified"}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span>
                                    <strong>Chef:</strong>{" "}
                                    {recipe.chef || "Not specified"}
                                  </span>
                                  <span>
                                    <strong>Tags:</strong>{" "}
                                    {recipe.tags && recipe.tags.length > 0
                                      ? recipe.tags.join(", ")
                                      : "None"}
                                  </span>
                                </div>
                              </div>

                              <div className="recipe-sections">
                                <div className="recipe-section">
                                  <h4>Ingredients:</h4>
                                  {recipe.ingredients &&
                                  recipe.ingredients.length > 0 ? (
                                    <ul>
                                      {recipe.ingredients.map(
                                        (ingredient, idx) => (
                                          <li key={idx}>{ingredient}</li>
                                        )
                                      )}
                                    </ul>
                                  ) : (
                                    <p>No ingredients listed</p>
                                  )}
                                </div>

                                <div className="recipe-section">
                                  <h4>Kitchen Equipment:</h4>
                                  {recipe.kitchenEquipment &&
                                  recipe.kitchenEquipment.length > 0 ? (
                                    <ul>
                                      {recipe.kitchenEquipment.map(
                                        (equipment, idx) => (
                                          <li key={idx}>{equipment}</li>
                                        )
                                      )}
                                    </ul>
                                  ) : (
                                    <p>No equipment listed</p>
                                  )}
                                </div>
                              </div>

                              <div className="recipe-section instructions">
                                <h4>Instructions:</h4>
                                {recipe.instructions &&
                                recipe.instructions.length > 0 ? (
                                  <ol>
                                    {recipe.instructions.map((step, idx) => (
                                      <li key={idx}>{step}</li>
                                    ))}
                                  </ol>
                                ) : (
                                  <p>No instructions listed</p>
                                )}
                              </div>

                              <div className="recipe-meta">
                                <p>
                                  <strong>Created:</strong>{" "}
                                  {recipe.createdAt &&
                                  !isNaN(new Date(recipe.createdAt).getTime())
                                    ? new Date(
                                        recipe.createdAt
                                      ).toLocaleString()
                                    : "Date not available"}
                                </p>
                                <p>
                                  <strong>Last Updated:</strong>{" "}
                                  {recipe.updatedAt &&
                                  !isNaN(new Date(recipe.updatedAt).getTime())
                                    ? new Date(
                                        recipe.updatedAt
                                      ).toLocaleString()
                                    : "Date not available"}
                                </p>
                              </div>
                              <div className="recipe-actions">
                                <Link
                                  to={`/update/${recipe._id}`}
                                  className="action-button"
                                >
                                  Update
                                </Link>
                                <button
                                  onClick={() => handleDelete(recipe._id)}
                                  className="action-button delete"
                                >
                                  Delete
                                </button>
                              </div>
                            </article>
                          ))
                        )}
                      </div>

                      <Pagination />
                    </>
                  )}
                </div>
              }
            />
            <Route
              path="/add"
              element={<AddRecipe onRecipeAdded={() => fetchRecipes(1)} />}
            />
            <Route
              path="/update/:id"
              element={<UpdateRecipe onRecipeUpdated={() => fetchRecipes(1)} />}
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
