import { Router } from "express";
import { addDriverInTrips, createTrip, getTrips, getTripsByIDs } from "../controllers/index.js";
import auth from "../middlewares/auth.js";

const router = Router({ mergeParams: true });

router.post("/", auth, async (req, res) => {
  const isOnlyUserTrips = req.body?.onlyUserTrips;
  const filter = req.body?.filter;
  try {
    const responsible = await getTrips({ onlyUserTrips: isOnlyUserTrips, userId: req.user.id, filter });
    if (responsible.error) {
      res.status(responsible.code ?? 500).send({
        code: responsible.code ?? 500,
        error: responsible.error,
        isFilterError: responsible.isFilterError ?? false,
      });
    } else res.send({ body: responsible });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/getByIDs", auth, async ({ body }, res) => {
  const idArray = body?.idArray;
  const responsible = await getTripsByIDs(idArray);
  if (responsible.error) {
    res.status(responsible.code ?? 500).send({
      code: responsible.code ?? 500,
      error: responsible.error,
    });
  } else res.send({ body: responsible });
  try {
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

router.post("/confirmDriver", auth, async ({ body }, res) => {
  try {
    await addDriverInTrips(body.idArray, body.driverID);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

export default router;
