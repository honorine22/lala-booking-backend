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

// Get a property by ID
export const getProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "Error fetching property", message: (error as any).message });
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
      res.status(400).json({ error: "Check-in and check-out timestamps are required" });
      return;
    }

    const checkInDateTime = new Date(checkIn as string);
    const checkOutDateTime = new Date(checkOut as string);

    // Find booked properties that have overlapping datetime bookings
    const bookedProperties = await prisma.booking.findMany({
      where: {
        OR: [
          {
            AND: [
              { checkIn: { lte: checkOutDateTime } }, // Booking starts before requested checkout
              { checkOut: { gte: checkInDateTime } }, // Booking ends after requested check-in
            ],
          },
        ],
      },
      select: { propertyId: true },
    });

    const bookedPropertyIds = bookedProperties.map((booking) => booking.propertyId);

    // Get available properties (not in the booked list)
    const availableProperties = await prisma.property.findMany({
      where: {
        id: { notIn: bookedPropertyIds },
      },
    });

    res.json(availableProperties);
  } catch (error) {
    res.status(500).json({ error: "Error fetching available properties", message: (error as any).message });
  }
};
