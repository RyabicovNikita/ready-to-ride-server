import { DateTime } from "luxon";
import { pool } from "../config/db.js";
import { DB_ERROR, SELECTED_VALUES } from "../constants/index.js";
import { mapTrip, mapTripCard } from "../mappers/mapTrip.js";

export const getTrips = async ({ onlyUserTrips, userId, filter: filterParams }) => {
  const { fromWhere, toWhere, notDriver, priceFrom, priceTo, numberPeopleFrom, dateTrip, timeTrip, numberPeopleTo } =
    filterParams;
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

  const isNotDriverSelected = notDriver !== SELECTED_VALUES.NOT_SELECT;
  const filter = createFilter();

  filter.addWhereCondition(onlyUserTrips ? userId : null, "created_by");
  filter.addWhereCondition(fromWhere, "fromwhere");
  filter.addWhereCondition(toWhere, "towhere");
  filter.addWhereCondition(dateTrip, "datetime::date");
  filter.addWhereCondition(timeTrip, "datetime::time");
  if (!isNotDriverSelected) filter.addWhereCondition(notDriver ? "NULL" : -1, "driver", ">");
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
  ${userFilter} ORDER BY created_at DESC
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

  if (trips.rowCount === 0) throw Error("Не найдено");
  return trips.rows.map((trip) => mapTrip(trip));
};

export const getTrip = async (idTrip) => {
  const trips = await pool.query(
    `SELECT trips.*, 
    pass.first_name AS pass_firstName, 
    pass.last_name AS pass_lastName, 
    driver.first_name AS driver_firstName, 
    driver.last_name AS driver_lastName 
    FROM trips 
    LEFT JOIN users AS pass ON trips.created_by = pass.id 
    LEFT JOIN users AS driver ON trips.driver = driver.id WHERE trips.id = $1`,
    [idTrip]
  );

  if (trips.rowCount === 0) throw Error("Не найдено");
  return trips.rows.map((trip) => mapTripCard(trip));
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
      "INSERT INTO trips (fromwhere, towhere, datetime, passengerprice, numberpeople, created_by, status, totalprice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [fromWhere, toWhere, datetime, passengerPrice, numberPeople, createdBy, status, passengerPrice]
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

export const addDriverInTrips = async (arrayIDs, driverID) => {
  const res = await pool.query("UPDATE trips SET driver=$1 WHERE id = ANY($2)", [driverID, arrayIDs]).catch((e) => ({
    error: e,
  }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
};
