import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./utils/passport"; // Google OAuth setup
import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import bookingRoutes from "./routes/booking.routes";
import prisma from "./utils/prismaClient";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1); // Exit the process if the database connection fails
    }
};

// Start the server
startServer();
