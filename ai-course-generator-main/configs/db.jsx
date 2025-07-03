import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

console.log("Initializing database connection...");
console.log("Connection String:", process.env.NEXT_PUBLIC_DB_CONNECTION_STRING);

const sql = neon(process.env.NEXT_PUBLIC_DB_CONNECTION_STRING);

console.log("Database client initialized with Neon.");
export const db = drizzle({ client: sql });

console.log("Drizzle ORM initialized.");