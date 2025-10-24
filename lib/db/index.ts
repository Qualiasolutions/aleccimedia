import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

// For production/serverless environments, use connection pooling
// This prevents connection leaks in serverless functions
const connectionString = env.POSTGRES_URL;

// Configure connection for serverless environment
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for edge compatibility
  max: 1, // Limit connections for serverless environment
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  max_lifetime: 60, // Max connection lifetime
});

export const db = drizzle(client, { schema });

// Export schema for easy access
export * from "./schema";
export { schema };

// Helper function to test database connection
export async function testConnection() {
  try {
    await client`SELECT 1`;
    return { success: true, message: "Database connection successful" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Graceful shutdown helper
export async function closeConnection() {
  try {
    await client.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}
