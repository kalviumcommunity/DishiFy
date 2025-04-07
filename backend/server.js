require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Import routes
const routes = require("./routes");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Call the database connection
connectDB();

// Check MongoDB connection status
app.get("/", (req, res) => {
  const connectionStatus = mongoose.connection.readyState;
  let statusMessage;

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

// Use API routes
app.use("/api", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
