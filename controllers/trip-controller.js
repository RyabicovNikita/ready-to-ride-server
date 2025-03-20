import { DateTime } from "luxon";
import { pool } from "../config/db.js";
import { DB_ERROR, SELECTED_VALUES, TRIP_STATUSES } from "../constants/index.js";
import { mapTrip, mapTripCard } from "../mappers/mapTrip.js";
import { getTripComments } from "./comment-controller.js";

export const getTrips = async ({ onlyUserTrips, userId, filter: filterParams }) => {
  const {
    fromWhere,
    toWhere,
    notDriver = "Не выбрано",
    priceFrom,
    priceTo,
    numberPeopleFrom,
    dateTrip,
    timeTrip,
    numberPeopleTo,
  } = filterParams;
  const createFilter = () => {
    let counter = 1;
    let filter = "";
    const valueArr = [];
    return {
      addWhereCondition: (value, bdFieldName, sign = "=") => {
        if (!value || value === SELECTED_VALUES.NOT_SELECT) return;
        if (value === "NULL") {
          filter += !filter ? ` WHERE ${bdFieldName} IS NULL` : ` AND ${bdFieldName} IS NULL`;

          return;
        }
        filter += !filter ? ` WHERE ${bdFieldName} ${sign} $${counter}` : ` AND ${bdFieldName} ${sign} $${counter}`;
        counter += 1;
        valueArr.push(value);
      },
      addFromToCondition: (to, from, bdFieldName) => {
        if (!to && !from) return;
        if (to && !from) {
          if (!filter) filter = ` WHERE ${bdFieldName} >= $${counter}`;
          else filter += ` AND ${bdFieldName} >= $${counter}`;
          counter += 1;
          valueArr.push(to);
        } else if (from && !to) {
          if (!filter) filter = ` WHERE ${bdFieldName} <=$${counter}`;
          else filter += ` AND ${bdFieldName} <=$${counter}`;
          counter += 1;
          valueArr.push(from);
        } else {
          if (!filter) filter = ` WHERE ${bdFieldName} >= $${counter} AND ${bdFieldName} <=$${counter + 1}`;
          else filter += ` AND ${bdFieldName} >= $${counter} AND ${bdFieldName} <=$${counter + 1}`;
          counter += 2;
          valueArr.push(to, from);
        }
      },
      get: () => ({
        userFilter: filter,
        userFilterValues: valueArr,
      }),
    };
  };

  const driverFilterEmpty = notDriver === SELECTED_VALUES.NOT_SELECT;
  const filter = createFilter();

  filter.addWhereCondition(onlyUserTrips ? userId : null, "created_by");
  filter.addWhereCondition(fromWhere, "fromwhere");
  filter.addWhereCondition(toWhere, "towhere");
  filter.addWhereCondition(dateTrip, "datetime::date");
  filter.addWhereCondition(timeTrip, "datetime::time");
  if (!driverFilterEmpty) filter.addWhereCondition(notDriver ? "NULL" : -1, "driver", ">");
  filter.addFromToCondition(priceFrom, priceTo, "totalprice");
  filter.addFromToCondition(numberPeopleFrom, numberPeopleTo, "numberpeople");

  const { userFilter, userFilterValues: valuesQuery } = filter.get();

  const bodyQuery = `SELECT trips.*, 
  pass.first_name AS pass_firstName, 
  pass.last_name AS pass_lastName, 
  driver.first_name AS driver_firstName, 
  driver.last_name AS driver_lastName 
  FROM trips 
  LEFT JOIN users AS pass ON trips.created_by = pass.id 
  LEFT JOIN users AS driver ON trips.driver = driver.id 
  ${userFilter ? userFilter + " AND" : "WHERE"}  trips.status <> '${TRIP_STATUSES.CANCEL}' ORDER BY created_at DESC
  `;

  const trips = await pool.query(bodyQuery, valuesQuery);
  if (onlyUserTrips && trips.rowCount === 0) return { code: 404, error: "Активных поездок нет" };
  if (trips.rowCount === 0) return { code: 404, isFilterError: true, error: "Не найдено ни одной поездки :(" };

  return trips.rows.map((trip) => mapTrip(trip));
};

export const getTripsByIDs = async (arrayIDs) => {
  const trips = await pool.query(
    `SELECT trips.*, 
    pass.first_name AS pass_firstName, 
    pass.last_name AS pass_lastName, 
    driver.first_name AS driver_firstName, 
    driver.last_name AS driver_lastName 
    FROM trips 
    LEFT JOIN users AS pass ON trips.created_by = pass.id 
    LEFT JOIN users AS driver ON trips.driver = driver.id WHERE trips.id = ANY($1)`,
    [arrayIDs]
  );

  if (trips.rowCount === 0) throw Error("Поездки не найдены");
  return trips.rows.map((trip) => mapTrip(trip));
};

export const getTrip = async (tripID) => {
  const trips = await pool.query(
    `SELECT trips.*, 
    pass.first_name AS pass_firstName, 
    pass.last_name AS pass_lastName, 
    driver.first_name AS driver_firstName, 
    driver.last_name AS driver_lastName 
    FROM trips 
    LEFT JOIN users AS pass ON trips.created_by = pass.id 
    LEFT JOIN users AS driver ON trips.driver = driver.id WHERE trips.id = $1`,
    [tripID]
  );
  if (trips.rowCount === 0) throw Error("Такой поездки не существует");
  const comments = await getTripComments(tripID);
  return mapTripCard(trips.rows[0], comments);
};

export const createTrip = async ({
  fromWhere,
  toWhere,
  datetime,
  passengerPrice,
  numberPeople = 0,
  createdBy,
  status,
}) => {
  if (!createdBy) throw Error("Данное действие доступно только авторизованным пользователям.");

  const activeUserTrips = await pool.query(
    `SELECT id FROM trips WHERE fromwhere = $1 and towhere = $2 and created_by = $3 and DATE(datetime) = $4 and status <> 'Отменена'`,
    [fromWhere, toWhere, createdBy, DateTime.fromISO(datetime).toFormat("yyyy-MM-dd")]
  );
  if (activeUserTrips.rowCount > 0) throw Error("По данному маршруту у вас уже есть активная поездка");
  const res = await pool
    .query(
      "INSERT INTO trips (fromwhere, towhere, datetime, passengerprice, numberpeople, created_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [fromWhere, toWhere, datetime, passengerPrice, numberPeople, createdBy, status]
    )
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
  const trip = res.rows[0];
  return trip;
};

export const addDriverInTrips = async (tripsData, driverID) => {
  tripsData.forEach(async (trip) => {
    const res = await pool
      .query("UPDATE trips SET driver=$1, driverprice=$2, status=$3 WHERE id=$4", [
        driverID,
        trip.driverPrice,
        TRIP_STATUSES.CORRECTED_PRICE,
        trip.id,
      ])
      .catch((e) => ({
        error: e,
      }));
    if (res.error) {
      if (!DB_ERROR[res.error.code]) console.error(res.error);
      throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
    }
  });
};

export const confirmDriver = async (tripID, totalPrice) => {
  const res = await pool
    .query("UPDATE trips SET status=$1,totalprice=$2 WHERE id=$3", [TRIP_STATUSES.READY, totalPrice, tripID])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};

export const cancelTrip = async (tripID) => {
  const res = await pool
    .query("UPDATE trips SET status=$1, driver=NULL WHERE id=$2", [TRIP_STATUSES.CANCEL, tripID])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};

export const looseDriver = async (tripID) => {
  const res = await pool
    .query("UPDATE trips SET status=$1, driver=NULL, totalprice=0, driverprice=0 WHERE id=$2", [
      TRIP_STATUSES.NEW,
      tripID,
    ])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};

export const updateTrip = async ({ fromWhere, toWhere, passengerPrice, numberPeople, tripID }) => {
  const res = await pool
    .query("UPDATE trips SET fromwhere=$1, towhere=$2, passengerprice=$3, numberpeople=$4 WHERE id=$5", [
      fromWhere,
      toWhere,
      passengerPrice,
      numberPeople,
      tripID,
    ])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};

export const deleteTrip = async (id) => {
  const res = await pool.query("DELETE FROM trips WHERE id=$1", [id]).catch((e) => ({
    error: e,
  }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};
