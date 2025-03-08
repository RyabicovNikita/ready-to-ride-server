import { Router } from "express";
import {
  addDriverInTrips,
  cancelTrip,
  confirmDriver,
  createTrip,
  getTrip,
  getTrips,
  getTripsByIDs,
  looseDriver,
} from "../controllers/index.js";
import auth from "../middlewares/auth.js";

const router = Router({ mergeParams: true });

router.post("/looseDriver", auth, async (req, res) => {
  console.log("??");
  try {
    await looseDriver(req.body.id);

    res.send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/getByIDs", auth, async ({ body }, res) => {
  try {
    const idArray = body?.idArray;
    const responsible = await getTripsByIDs(idArray.map((i) => i.id));
    if (responsible.error) {
      res.status(responsible.code ?? 500).send({
        code: responsible.code ?? 500,
        error: responsible.error,
      });
    } else res.send({ body: responsible });
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

router.post("/addDriverInTrips", auth, async ({ body }, res) => {
  try {
    await addDriverInTrips(body.tripsData, body.driverID);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/confirmDriver", auth, async ({ body }, res) => {
  try {
    await confirmDriver(body.id, body.totalPrice);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/cancelTrip", auth, async (req, res) => {
  try {
    await cancelTrip(req.body.id);

    res.send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/:id", auth, async (req, res) => {
  try {
    const tripArr = await getTrip(req.body.id);

    res.send({ body: tripArr[0] });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

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

export default router;
