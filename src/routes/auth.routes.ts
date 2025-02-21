import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { getUsers, logoutUser } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token, user });
  }
);

userRouter.post("/logout", logoutUser);

userRouter.get("/", authMiddleware, getUsers);

export default userRouter;
