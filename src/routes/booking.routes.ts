import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { confirmBooking, createBooking, deleteBooking, getBookings, updateBookingStatus } from "../controllers/booking.controller";

const bookingRouter = express.Router();

bookingRouter.post("/", authMiddleware, createBooking);
bookingRouter.put("/:id/status", authMiddleware, updateBookingStatus);
// COnfirm booking route
bookingRouter.patch("/:id/confirm", authMiddleware, confirmBooking);
bookingRouter.delete("/:id", authMiddleware, deleteBooking);
bookingRouter.get("/", authMiddleware, getBookings);

export default bookingRouter;
