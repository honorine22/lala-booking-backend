import express from "express";
import { createProperty, deleteProperty, getProperties, updateProperty } from "../controllers/property.controller";
import authMiddleware from "../middlewares/authMiddleware";

const propertyRouter = express.Router();

propertyRouter.post("/", authMiddleware, createProperty);
propertyRouter.get("/", getProperties);
propertyRouter.put("/:id", authMiddleware, updateProperty);
propertyRouter.delete("/:id", authMiddleware, deleteProperty);

export default propertyRouter;
