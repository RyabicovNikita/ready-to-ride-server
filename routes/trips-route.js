import { Router } from "express";
import { createTrip, getTrips } from "../controllers/index.js";
import auth from "../middlewares/auth.js";

const router = Router({ mergeParams: true });

router.post("/", auth, async (req, res) => {
  try {
    const trips = await getTrips({ onlyUserTrips: req.body?.onlyUserTrips, userId: req.user.id });
    res.send({ body: trips });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/new", async ({ body }, res) => {
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
