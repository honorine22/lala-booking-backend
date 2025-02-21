import { Request, Response } from "express";
import prisma from "../utils/prismaClient";

export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, description, price, location } = req.body;
    const property = await prisma.property.create({
      data: {
        title,
        description,
        price,
        location,
        hostId: (req as any).user.id,
      },
    });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Error creating property" });
  }
};

export const getProperties = async (_req: Request, res: Response) => {
  const properties = await prisma.property.findMany();
  res.json(properties);
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, location } = req.body;
    const hostId = (req as any).user.id;

    const property = await prisma.property.update({
      where: { id, hostId },
      data: { title, description, price, location },
    });

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Error updating property", message: (error as any).message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hostId = (req as any).user.id;

    await prisma.property.delete({ where: { id, hostId } });

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting property", message: (error as any).message });
  }
};

export const getAvailableProperties = async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Check-in and check-out dates are required" });
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    // Find properties that have overlapping bookings
    const bookedProperties = await prisma.booking.findMany({
      where: {
        OR: [
          { checkIn: { lte: checkOutDate }, checkOut: { gte: checkInDate } }, // Overlapping booking
        ],
      },
      select: { propertyId: true },
    });

    const bookedPropertyIds = bookedProperties.map((booking) => booking.propertyId);

    // Find properties that are NOT booked
    const availableProperties = await prisma.property.findMany({
      where: {
        id: { notIn: bookedPropertyIds }, // Exclude booked properties
      },
    });

    res.json(availableProperties);
  } catch (error) {
    res.status(500).json({ error: "Error fetching available properties", message: (error as any).message });
  }
};
