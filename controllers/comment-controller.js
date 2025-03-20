import { pool } from "../config/db.js";
import { DB_ERROR } from "../constants/dbCodeErrors.js";
import { mapComment } from "../mappers/mapComment.js";
export const getTripComments = async (tripID) => {
  const comments = await pool.query(
    "SELECT comments.*, users.first_name, users.last_name, users.isdriver FROM comments JOIN users ON users.id = comments.user_id WHERE trip_id = $1",
    [tripID]
  );

  if (comments.rowCount === 0) return [];

  return comments.rows.map((i) => mapComment(i));
};

export const addParentCommentInTrip = async (tripID, userID, text) => {
  const res = await pool
    .query(
      `
        WITH newComment AS (
            INSERT INTO comments (user_id, trip_id, text) 
            VALUES ($1, $2, $3) 
            RETURNING *
        )
        SELECT newComment.*, users.first_name, users.last_name
        FROM newComment
        JOIN users ON users.id = newComment.user_id
    `,
      [userID, tripID, text]
    )
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
  const comment = res.rows[0];
  return mapComment(comment);
};
