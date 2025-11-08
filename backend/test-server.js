import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Current directory:", __dirname);

// Load environment variables
const result = dotenv.config({ path: __dirname + "/.env.local" });
console.log("Dotenv result:", result);

console.log("Environment variables:", process.env);

console.log("Test server starting...");
console.log("PORT:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "Test server is running" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});