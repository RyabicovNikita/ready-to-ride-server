import { pool } from "../config/db.js";
import { ERRORS } from "../constants/errors.js";
import { verifyToken } from "../helpers/index.js";
import { mapAuthUser } from "./../mappers/mapUser.js";

const ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN;

async function auth(req, res, next) {
  if (!req.cookies.token) {
    res.send({ error: ERRORS.NOT_AUTH });
    return;
  }
  try {
    const tokenData = verifyToken(req.cookies.token, ACCESS_SECRET_KEY);

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [tokenData.id]);
    if (user.rowCount === 0) {
      res.send({ error: ERRORS.NOT_AUTH });
      return;
    }
    req.user = mapAuthUser(user.rows[0]);
  } catch (e) {
    res.send({ error: e.message });
    return;
  }

  next();
}

export default auth;
