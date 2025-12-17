import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import socketService from "./services/socket.service";
// import transactionExpiryService from './services/transactionExpiryService';

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.MONGODB_URI as string;

const startServer = async () => {
  try {
    // Connect to the database
    const dbInstance = new connectDB(DB_URL);
    await dbInstance.connect();

    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.IO
    socketService.initialize(server);

    // Start the transaction expiry service
    // transactionExpiryService.startExpiryCheck();

    // Start the HTTP server
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Socket.IO initialized successfully`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Gracefully shutting down...");
      // Stop the transaction expiry service
      // transactionExpiryService.stopExpiryCheck();
      await dbInstance.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Termination signal received. Closing app...");
      // Stop the transaction expiry service
      // transactionExpiryService.stopExpiryCheck();
      await dbInstance.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

startServer();
