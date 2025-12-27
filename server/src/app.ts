/**
 * Main Application Configuration File
 * This file sets up the Express application with all necessary middleware,
 * security configurations, and route handling.
 */

// Import required dependencies
import compression from "compression"; // For response compression
import cookieParser from "cookie-parser"; // For parsing cookies
import cors from "cors"; // For handling Cross-Origin Resource Sharing
import dotenv from "dotenv"; // For environment variable management
import express from "express"; // Web framework
import session from "express-session"; // For session management
import helmet from "helmet"; // Security headers middleware
import morgan from "morgan"; // HTTP request logger
import path from "path"; // Path manipulation utilities

// Import custom configurations and utilities
import passport from "./config/passport"; // Authentication configuration
import { errorHandler } from "./middlewares/error-handler"; // Global error handling
import router from "./routes"; // Main application routes
import "./services/bonusCron"; // Cron service for bonus points management
import { ApiResponse } from "./utils/api-response"; // Standardized API response format
import { initializePaymentGateways } from "./services/payment/init"; // Payment gateway setup
import { logger } from "./utils/logger"; // Custom logging utility

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Trust proxy configuration - Important when running behind a reverse proxy (e.g., Nginx)
app.set("trust proxy", 1);

/**
 * Custom Request Logging Middleware
 * Logs detailed information about each incoming request including:
 * - HTTP method
 * - Request path
 * - Client IP address
 * - User agent
 * - Origin
 */
app.use((req, res, next) => {
  const clientIp =
    req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
  logger.info("Incoming Request", {
    method: req.method,
    path: req.path,
    ip: clientIp,
    userAgent: req.headers["user-agent"],
    origin: req.headers.origin,
  });
  next();
});

// Initialize payment gateway configurations
initializePaymentGateways();

// Basic middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan("common")); // HTTP request logging
app.use("/public", express.static(path.join(__dirname, "../public"))); // Serve static files
app.use(cookieParser()); // Parse cookies

/**
 * Session Configuration
 * Sets up session management with the following options:
 * - secret: Session encryption key from environment variables
 * - resave: Force session to be saved back to the session store
 * - saveUninitialized: Force uninitialized sessions to be saved
 */
const sessionConfig = {
  secret: process.env.EXPRESS_SESSION_SECRET as string,
  resave: true,
  saveUninitialized: true,
};

/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing with:
 * - Dynamic origin checking against allowed origins from environment variables
 * - Specific HTTP methods allowed
 * - Credentials support for authenticated requests
 */
const allowedOrigins = process.env.ORIGINS?.split(",") || [];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow all origins dynamically
//       callback(null, origin);
//     },
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      if (!origin || allowedOrigins.includes(origin)) {
        console.log("✅ Allowed:", origin);
        callback(null, true);
      } else {
        console.log("❌ Blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
/**
 * Maps the URL prefix "/uploads" to the physical "public" folder.
 */
app.use(express.static(path.join(process.cwd(), "public")));

// Authentication and Session Middleware
app.use(session(sessionConfig)); // Initialize session handling
// app.use(passport.initialize()); // Initialize Passport authentication
// app.use(passport.session()); // Enable persistent login sessions

// Security and Performance Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(compression()); // Compress response bodies

/**
 * Root Route Handler
 * Serves as a health check endpoint and returns a welcome message
 */
app.get("/", async (req, res, next) => {
  res.status(200).json(new ApiResponse(200, null, "Hello from the server"));
});

// Mount API routes under /api/v1 prefix
app.use("/api/v1", router);

// Global error handling middleware
app.use(errorHandler);

export default app;
