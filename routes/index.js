import { Router } from "express";
import authRoutes from "./auth-route.js";
import tripsRoutes from "./trips-route.js";

const router = Router({ mergeParams: true });

router.use("/", authRoutes);
router.use("/trips", tripsRoutes);
router.use("/myTrips", tripsRoutes);

export default router;
