import { FORMATES_DATE } from "../constants/index.js";
import { formatUTCDate } from "../helpers/index.js";

export const mapTrip = (trip) => ({
  id: trip.id,
  created_at: formatUTCDate(trip.created_at),
  creator: {
    id: trip.created_by,
    userName: trip.pass_firstname + " " + trip.pass_lastname,
  },
  driver: {
    id: trip.driver,
    userName: trip.driver_lastname ? trip.driver_firstname + " " + trip.driver_lastname : trip.driver_lastname,
  },
  dateTravel: formatUTCDate(trip.datetime, FORMATES_DATE.DATE),
  timeTravel: formatUTCDate(trip.datetime, FORMATES_DATE.TIME),
  fromWhere: trip.fromwhere,
  toWhere: trip.towhere,
  passengersNumber: trip.numberpeople,
});
