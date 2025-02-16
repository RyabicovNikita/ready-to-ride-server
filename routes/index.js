import { Router } from "express";
import authRoutes from "./auth-route.js";

const router = Router({ mergeParams: true });

router.use("/", authRoutes);

export default router;
