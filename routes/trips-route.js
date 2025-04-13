import { Router } from "express";
import {
  addDriverInTrips,
  cancelTrip,
  confirmDriver,
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  getTripsByIDs,
  looseDriver,
  updateTrip,
} from "../controllers/index.js";
import auth from "../middlewares/auth.js";
import checkUserAccess from "../middlewares/checkUserAccess.js";
import { DRIVER_BREADCRUMBS, PASS_BREADCRUMBS } from "../constants/breadcrumbs.js";
import { hasRole } from "../middlewares/hasRole.js";
import ROLES from "../constants/roles.js";

import commentRoutes from "./comments-route.js";

const { DELETE_DRIVER_FROM_TRIP, NEW_TRIP, CANCEL_TRIP, CONFIRM_DRIVER_TRIP, TRIP } = PASS_BREADCRUMBS;
const { CONFIRM_TRIPS } = DRIVER_BREADCRUMBS;

const router = Router({ mergeParams: true });

router.use("/comments", commentRoutes);

router.delete(DELETE_DRIVER_FROM_TRIP, auth, checkUserAccess(DELETE_DRIVER_FROM_TRIP), async (req, res) => {
  try {
    await looseDriver(req.body.id);

    res.send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/getByIDs", auth, async ({ body }, res) => {
  try {
    const idArray = body.idArray ?? [];
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

router.post(NEW_TRIP, auth, checkUserAccess(NEW_TRIP), async ({ body }, res) => {
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

router.patch(CONFIRM_DRIVER_TRIP, auth, checkUserAccess(CONFIRM_DRIVER_TRIP), async ({ body }, res) => {
  try {
    await confirmDriver(body.id, body.totalPrice);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post(CONFIRM_TRIPS, auth, checkUserAccess(CONFIRM_TRIPS), async ({ body }, res) => {
  try {
    await addDriverInTrips(body.tripsData, body.driverID);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.patch(CANCEL_TRIP, auth, checkUserAccess(CANCEL_TRIP), async (req, res) => {
  try {
    await cancelTrip(req.body.id);

    res.send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.patch(TRIP, auth, checkUserAccess(TRIP), async (req, res) => {
  try {
    const data = req.body;
    const tripID = req.params.id;
    const updatedTrip = await updateTrip({
      fromWhere: data.fromWhere,
      toWhere: data.toWhere,
      numberPeople: data.numberPeople,
      passengerPrice: data.passengerPrice,
      datetime: data.datetime,
      tripID,
    });
    res.send({ body: updatedTrip });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.delete(TRIP, auth, hasRole(ROLES.ADMIN, ROLES.MODERATOR), async (req, res) => {
  try {
    const tripID = req.params.id;
    await deleteTrip(tripID);
    res.send({});
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.get(TRIP, auth, async (req, res) => {
  try {
    const id = req.params.id;
    const trip = await getTrip(id);

    res.send({ body: trip });
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
