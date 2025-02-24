import { FORMATES_DATE } from "../constants/index.js";
import { formatUTCDate } from "../helpers/index.js";

export const mapTrip = (trip) => ({
  created_at: formatUTCDate(trip.created_at),
  creator: {
    id: trip.created_by,
    userName: trip.pass_firstname + " " + trip.pass_lastname,
  },
  driver: trip.driver_lastName ? trip.driver_firstName + " " + trip.driver_lastName : null,
  dateTravel: formatUTCDate(trip.datetime, FORMATES_DATE.DATE),
  timeTravel: formatUTCDate(trip.datetime, FORMATES_DATE.TIME),
  fromWhere: trip.fromwhere,
  toWhere: trip.towhere,
  passengersNumber: trip.numberpeople,
});
