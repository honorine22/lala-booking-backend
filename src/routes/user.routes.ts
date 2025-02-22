import express from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller";
const userRoutes = express.Router();

// Get all users
userRoutes.get('/', getAllUsers);

// Get a single user by ID
userRoutes.get('/:id', getUserById);

// Update user by ID
userRoutes.put('/:id', updateUser);

// Delete user by ID
userRoutes.delete('/:id', deleteUser);

export default userRoutes;
