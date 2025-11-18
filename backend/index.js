import express from "express";
import routes from "./routes.js";
import cors from "cors"; 
import dotenv from "dotenv"

// Complete me (loading the necessary packages)
dotenv.config(); // loads environemnt variables 

const app = express();

// Load .env using dotenv and read value OR resort to default if the frontendurl doesn't exist 
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Complete me (CORS)
// basically browser blocks requests from frontend to backend because they are different ports and CORS lets the backend accept such requests 
app.use(cors({
    origin: FRONTEND_URL, 
    credentials: true
})); 

app.use(express.json());
app.use('', routes);

export default app;