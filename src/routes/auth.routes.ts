import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { serialize } from 'cookie'
import { getUsers, logoutUser } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/authMiddleware";

const userRouter = express.Router();

// userRouter.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// userRouter.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const user = req.user as any;
//     const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });
//     res.json({ token, user });
//   }
// );

userRouter.get("/google", (req, res, next) => {
  const redirectUrl = req.query.redirect || process.env.FRONTEND_URL;

  // Redirect to Google OAuth with the redirect URL as a query parameter
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectUrl as string, // Pass redirect URL as state
  })(req, res, next);
});

userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`);
    }
    console.log("user: ", user);

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    console.log(`token: ${token}`);
    res.setHeader('Set-Cookie', [
      serialize('authToken', token, {
        httpOnly: false, // Allows frontend to access it (for local testing only)
        secure: false,   // No need for HTTPS locally
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }),
      serialize('loggedInUser', JSON.stringify(user), {
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      }),
    ]);

    // Retrieve the redirect URL from state
    let redirectUrl = req.query.state as string || process.env.FRONTEND_URL || "/";
    console.log("redirectUrl: ", redirectUrl);

    try {
      redirectUrl = decodeURIComponent(redirectUrl);
    } catch (error) {
      redirectUrl = process.env.FRONTEND_URL || "/";
    }

    if (!redirectUrl.startsWith("http")) {
      redirectUrl = process.env.FRONTEND_URL || "/";
    }

    res.redirect(redirectUrl);
  }
);

userRouter.post("/logout", logoutUser);

userRouter.get("/", authMiddleware, getUsers);

export default userRouter;
