import { pool } from "../config/db.js";

export const createTrip = async ({ fromWhere, toWhere, totalPrice, userId }) => {
  const res = await pool
    .query("INSERT INTO trips (fromwhere, towhere, totalprice, user_id) VALUES ($1, $2, $3, $4) RETURNING *", [
      fromWhere,
      toWhere,
      totalPrice,
      userId,
    ])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
  const trip = res.rows[0];
  return trip;
};
