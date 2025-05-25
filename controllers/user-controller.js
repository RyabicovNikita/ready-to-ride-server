import { compare, hash } from "bcrypt";

import { pool } from "../config/db.js";
import { DB_ERROR } from "../constants/dbCodeErrors.js";
import { generateJWT } from "../helpers/index.js";
import { mapAuthUser, mapFullInfoUser } from "../mappers/mapUser.js";

const ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN;

export async function register({
  email,
  password,
  firstName,
  lastName,
  isDriver,
}) {
  if (!password) throw Error("Поле пароля не заполнено");
  const passwordHash = await hash(password, 10);
  const res = await pool
    .query(
      "INSERT INTO users (email, password, first_name, last_name, isdriver) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [email, passwordHash, firstName, lastName, isDriver]
    )
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    if (!DB_ERROR[res.error.code]) console.error(res.error);
    throw Error(
      DB_ERROR[res.error.code] || "База данных вернула некорректный ответ"
    );
  }
  const user = res.rows[0];
  const accessToken = generateJWT(user, ACCESS_SECRET_KEY, "1h");
  return { accessToken, user: mapAuthUser(user) };
}

export async function login(email, password) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (res.rowCount === 0) throw Error("Пользователь не найден");
  const user = res.rows[0];
  const isPasswordMatch = await compare(password, user.password);

  if (!isPasswordMatch) throw Error("Неверный пароль");

  const accessToken = generateJWT(user, ACCESS_SECRET_KEY, "1h");

  return { accessToken, user: mapAuthUser(user) };
}

export async function getUser(id) {
  const res = await pool.query("SELECT * from users WHERE id=$1", [id]);
  if (res.rowCount === 0) throw Error("Пользователь не найден");
  const user = res.rows[0];
  return mapFullInfoUser(user);
}

export async function updateUser({
  id,
  firstName,
  lastName,
  imageURL,
  birthday,
  driverAuto,
}) {
  const res = await pool.query(
    "UPDATE users SET first_name=$1, last_name=$2, imageurl=$3, drivercar=$4, birthday=$5 WHERE id=$6 RETURNING *",
    [firstName, lastName, imageURL, driverAuto, birthday, id]
  ) .catch((e) => ({
    error: e,
  }));

   if (res.error) {
      if (!DB_ERROR[res.error.code]) console.error(res.error);
      throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
    }
    
    const updatedUser = res.rows[0];
  
    return mapFullInfoUser(updatedUser);
  
}
