import { Router } from "express";
import { createTrip } from "../controllers/index.js";

const router = Router({ mergeParams: true });

router.post("/new", async ({ body }, res) => {
  try {
    const newTrip = await createTrip({
      fromWhere: body.fromWhere,
      toWhere: body.toWhere,
      totalPrice: body.price,
      userId: body.userId,
    });
    res.send({ body: newTrip });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

export default router;
