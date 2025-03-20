// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const app = express();
// const PORT = 3001;

// // Define a simple /ping route
// app.get("/ping", (req, res) => {
//   res.send("pong");
// });

// // Middleware
// app.use(express.json());

// // MongoDB connection using env
// const dbURI = process.env.URI;

// // Connect to MongoDB Atlas
// // mongoose
// //   .connect(dbURI)
// //   .then(() => console.log("Connected to MongoDB"))
// //   .catch((err) => console.log("Failed to connect to MongoDB:", err));

// // Define a test route
// app.get("/", (req, res) => {
//   res.send("Welcome to the Cookbook Project");
// });

// // // Start the server
// // app.listen(PORT, () => {
// //   console.log(`Server is running on http://localhost:${PORT}`);
// // });

// // // Export the app and mongoose connection
// // module.exports = { app, mongoose };
