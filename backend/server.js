require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();
const PORT = process.env.PORT || 5000;

// ====== MIDDLEWARE ======

// Security settings
app.use(helmet()); // Set secure HTTP headers

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Protect against NoSQL injection
app.use(mongoSanitize());

// Limit requests from same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Enable logging
app.use(morgan('dev'));

// Parse JSON request body
app.use(express.json({ limit: '10kb' }));

// ====== ROUTES ======
const routes = require("./routes");

// ====== DATABASE CONNECTION ======
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Time to find a server
      socketTimeoutMS: 45000, // Close inactive connections after 45 seconds
      family: 4 // Use IPv4
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

// Connect to database
connectDB();

// ====== API ROUTES ======

// Home route - check database status
app.get("/", (req, res) => {
  const connectionStatus = mongoose.connection.readyState;
  let statusMessage;

  // Convert connection number to readable message
  switch (connectionStatus) {
    case 0: statusMessage = "MongoDB is disconnected"; break;
    case 1: statusMessage = "MongoDB is connected"; break;
    case 2: statusMessage = "MongoDB is connecting"; break;
    case 3: statusMessage = "MongoDB is disconnecting"; break;
    default: statusMessage = "Unknown connection state";
  }

  res.send({
    message: "Welcome to the Cookbook app!",
    dbStatus: statusMessage,
    apiVersion: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// Use API routes from routes.js
app.use("/api", routes);

// ====== ERROR HANDLING ======

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 (route not found) errors
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// ====== SERVER STARTUP & SHUTDOWN ======

// Graceful shutdown on termination signal
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
