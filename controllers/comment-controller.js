import { pool } from "../config/db.js";

export const addParentCommentInTrip = async (tripID, userID, text) => {
  const res = await pool
    .query("INSERT INTO comments (user_id, trip_id, text) VALUES($1, $2, $3) RETURNING *", [userID, tripID, text])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
  const comment = res.rows[0];
  return comment;
};
