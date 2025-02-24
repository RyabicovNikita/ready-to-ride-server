import { Router } from "express";
import { createTrip } from "../controllers/index.js";

const router = Router({ mergeParams: true });

router.post("/", async ({ body }, res) => {
  try {
    const newTrip = await createTrip({
      fromWhere: body.fromWhere,
      toWhere: body.toWhere,
      passengerPrice: body.passengerPrice,
      createdBy: body.createdBy,
      datetime: body.datetime,
      numberPeople: body.numberPeople,
      status: body.status,
    });
    res.send({ body: newTrip });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

export default router;
