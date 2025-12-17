import mongoose from "mongoose";

export class connectDB {
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  // Connect to the database
  async connect(): Promise<void> {
    try {
      mongoose.set("strictQuery", true);
      const connection = await mongoose.connect(this.uri);
      // console.log(`Connected to DB: ${connection.connection.name}`);
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }

  // Disconnect from the database
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      // console.log("Disconnected from the database");
    } catch (error) {
      console.error("Error disconnecting from the database:", error);
    }
  }
}
