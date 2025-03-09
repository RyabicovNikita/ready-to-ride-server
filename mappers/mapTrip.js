import { FORMATES_DATE } from "../constants/index.js";
import { formatUTCDate } from "../helpers/index.js";

export const mapTrip = (trip) => ({
  id: trip.id,
  created_at: formatUTCDate(trip.created_at),
  creator: {
    id: trip.created_by,
    userName: trip.pass_firstname + " " + trip.pass_lastname,
    price: trip.passengerprice,
  },
  status: trip.status,
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

export const mapTripCard = (trip) => ({
  id: trip.id,
  status: trip.status,
  created_at: formatUTCDate(trip.created_at),
  creator: {
    id: trip.created_by,
    userName: trip.pass_firstname + " " + trip.pass_lastname,
    price: trip.passengerprice,
  },
  driver: {
    id: trip.driver,
    userName: trip.driver_lastname ? trip.driver_firstname + " " + trip.driver_lastname : trip.driver_lastname,
    price: trip.driverprice,
  },
  dateTravel: formatUTCDate(trip.datetime, FORMATES_DATE.DATE),
  timeTravel: formatUTCDate(trip.datetime, FORMATES_DATE.TIME),
  fromWhere: trip.fromwhere,
  toWhere: trip.towhere,
  passengersNumber: trip.numberpeople,
  totalPrice: trip.totalprice,
});
