import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import cors from 'cors';


const app: Application = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "your-default-mongo-url";

app.use(cors());

// Middleware
app.use(express.json());

// ... after app initialization
app.use("/users", userRoutes);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
