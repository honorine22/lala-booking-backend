import express from "express";
import { createProperty, deleteProperty, getAvailableProperties, getProperties, getProperty, updateProperty } from "../controllers/property.controller";
import authMiddleware from "../middlewares/authMiddleware";

const propertyRouter = express.Router();

propertyRouter.post("/", authMiddleware, createProperty);
propertyRouter.get("/", getProperties);
propertyRouter.put("/:id", authMiddleware, updateProperty);
propertyRouter.delete("/:id", authMiddleware, deleteProperty);
// getAvailableProperties with checkIn and checkOut query
propertyRouter.get("/available", getAvailableProperties);
propertyRouter.get("/:id", getProperty);

export default propertyRouter;
