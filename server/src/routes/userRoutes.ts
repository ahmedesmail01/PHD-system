import { Request, Response, Router, NextFunction } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { HydratedDocument } from "mongoose";

const router = Router();

// Type-safe route handler
type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Create a new user
const createUser: RouteHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const user: HydratedDocument<IUser> = new User({ name, email, password });
    const savedUser = await user.save();

    // Omit password from response
    const { password: _, ...userResponse } = savedUser.toObject();

    res.status(201).json(userResponse);
  } catch (error) {
    // Type-safe error handling
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
};

// Get all users
const getAllUsers: RouteHandler = async (req, res, next) => {
  try {
    const users: HydratedDocument<IUser>[] = await User.find();

    // Omit passwords from user responses
    const usersResponse = users.map((user) => {
      const { password: _, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    res.json(usersResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
};

// Login
const loginUser: RouteHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user: HydratedDocument<IUser> | null = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT secret is not configured" });
      return;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
};

// Register routes
router.post("/", createUser);
router.get("/", getAllUsers);
router.post("/login", loginUser);

export default router;
