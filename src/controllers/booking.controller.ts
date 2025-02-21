import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { BookingStatus } from "@prisma/client";
export const createBooking = async (req: Request, res: Response) => {
    try {
        const { propertyId, checkIn, checkOut } = req.body;

        // Convert check-in and check-out strings to Date objects
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // 1. Validate that check-out is after check-in
        if (checkOutDate <= checkInDate) {
            res.status(400).json({ error: "Check-out must be after check-in." });
            return;

        }

        // 2. Check for overlapping bookings
        const overlappingBooking = await prisma.booking.findFirst({
            where: {
                propertyId,
                AND: [
                    { status: { not: BookingStatus.CANCELED } }, // Booking is not canceled
                    // Check for overlapping bookings
                    { checkIn: { lt: checkOutDate } }, // Check-in is before new check-out
                    { checkOut: { gt: checkInDate } }, // 
                ],
            },
        });

        // If an overlapping booking is found, reject the new booking
        if (overlappingBooking) {
            res.status(400).json({ error: "This property is already booked within the selected dates. Choose a different time." });
            return;
        }

        // If no overlap, create the new booking
        const booking = await prisma.booking.create({
            data: {
                renterId: (req as any).user.id,
                propertyId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
            },
        });

        // Send successful response with the booking details
        res.json(booking);
    } catch (error) {
        // Handle server error
        res.status(500).json({
            error: "Error creating booking",
            message: (error as any).message,
        });
    }
};

// Confirm booking
export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.update({
            where: { id },
            data: { status: BookingStatus.CONFIRMED },
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: "Error confirming booking", message: (error as any).message });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: "Error updating booking status", message: (error as any).message });
    }
};

// Get bookings
export const getBookings = async (req: Request, res: Response) => {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
};

// Delete booking
export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.booking.delete({ where: { id } });

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting booking", message: (error as any).message });
    }
};