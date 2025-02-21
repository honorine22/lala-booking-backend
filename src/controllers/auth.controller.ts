import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token"); // Clear JWT token (if stored in cookies)
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error logging out", message: (error as any).message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users", message: (error as any).message });
    }
};
