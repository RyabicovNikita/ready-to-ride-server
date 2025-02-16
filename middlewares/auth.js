import { pool } from "../config/db.js";
import { ERRORS } from "../constants/errors.js";
import { verifyToken } from "../helpers/token.js";

async function auth(req, res, next) {
  if (!req.cookies.token) {
    res.send({ error: ERRORS.NOT_AUTH });
    return;
  }
  try {
    const tokenData = verifyToken(req.cookies.token);
    const user = pool.query("SELECT * FROM users WHERE id = $1", [tokenData.userId]);
    if (!user) {
      res.send({ error: ERRORS.NOT_AUTH });
      return;
    }
    req.user = user;
  } catch (e) {
    console.error(e.message);
    res.send(400);
    return;
  }

  next();
}

export default auth;
