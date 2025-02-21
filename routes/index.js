import { Router } from "express";
import authRoutes from "./auth-route.js";
import tripRoutes from "./trip-route.js";

const router = Router({ mergeParams: true });

router.use("/", authRoutes);
router.use("/trip", tripRoutes);

export default router;
