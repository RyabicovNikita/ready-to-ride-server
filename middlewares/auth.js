import { pool } from "../config/db.js";
import { ERRORS } from "../constants/errors.js";
import { verifyToken } from "../helpers/index.js";

const ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN;

async function auth(req, res, next) {
  if (!req.cookies.token) {
    res.send({ error: ERRORS.NOT_AUTH });
    return;
  }
  try {
    const tokenData = verifyToken(req.cookies.token, ACCESS_SECRET_KEY);

    const user = pool.query("SELECT * FROM users WHERE id = $1", [tokenData.userId]);
    if (!user) {
      res.send({ error: ERRORS.NOT_AUTH });
      return;
    }
    req.user = user;
  } catch (e) {
    res.send(401, { error: e.message });
    return;
  }

  next();
}

export default auth;
