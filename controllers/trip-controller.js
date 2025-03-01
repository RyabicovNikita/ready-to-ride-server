import { DateTime } from "luxon";
import { pool } from "../config/db.js";
import { DB_ERROR } from "../constants/dbCodeErrors.js";
import { mapTrip } from "../mappers/mapTrip.js";

export const getTrips = async ({ onlyUserTrips, userId, filter }) => {
  const trips = await pool.query(
    `SELECT trips.*, 
    pass.first_name AS pass_firstName, 
    pass.last_name AS pass_lastName, 
    driver.first_name AS driver_firstName, 
    driver.last_name AS driver_lastName 
    FROM trips 
    LEFT JOIN users AS pass ON trips.created_by = pass.id 
    LEFT JOIN users AS driver ON trips.driver = driver.id 
    ${onlyUserTrips ? "WHERE created_by = $1" : ""}`,
    onlyUserTrips ? [userId] : []
  );
  if (onlyUserTrips && trips.rowCount === 0) return { code: 404, error: "Активных поездок нет" };
  if (trips.rowCount === 0) return { code: 404, isFilterError: true, error: "Не найдено ни одной поездки :(" };
  return trips.rows.map((trip) => mapTrip(trip));
};

export const getTripsByIDs = async (idArray) => {
  const trips = await pool.query(
    `SELECT trips.*, 
    pass.first_name AS pass_firstName, 
    pass.last_name AS pass_lastName, 
    driver.first_name AS driver_firstName, 
    driver.last_name AS driver_lastName 
    FROM trips 
    LEFT JOIN users AS pass ON trips.created_by = pass.id 
    LEFT JOIN users AS driver ON trips.driver = driver.id WHERE trips.id = ANY($1)`,
    [idArray]
  );

  if (trips.rowCount === 0) return { code: 404, error: "У вас нет не подтверждённых поездок! :)" };
  return trips.rows.map((trip) => mapTrip(trip));
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
