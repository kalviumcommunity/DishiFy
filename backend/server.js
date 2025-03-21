require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Import routes
const recipeRoutes = require("./routes"); // <-- This is the new import for routes.js

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

// Call the database connection
connectDB();

// Check MongoDB connection status
app.get("/", (req, res) => {
  const connectionStatus = mongoose.connection.readyState;
  let statusMessage;

  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  switch (connectionStatus) {
    case 0:
      statusMessage = "MongoDB is disconnected";
      break;
    case 1:
      statusMessage = "MongoDB is connected";
      break;
    case 2:
      statusMessage = "MongoDB is connecting";
      break;
    case 3:
      statusMessage = "MongoDB is disconnecting";
      break;
    default:
      statusMessage = "Unknown connection state";
  }

  res.send({
    message: "Welcome to the Cookbook app!",
    dbStatus: statusMessage,
  });
});

// Ping route
app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// Use the recipe routes
app.use("/api", recipeRoutes); // <-- Use the routes at /api/recipes, /api/recipes/:id, etc.

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
