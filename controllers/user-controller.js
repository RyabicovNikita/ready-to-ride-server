import { compare, hash } from "bcrypt";
import { generateJWT } from "../helpers/token.js";
import { pool } from "../config/db.js";
import { DB_ERROR } from "../constants/dbCodeErrors.js";

const ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN;

export async function register(email, password) {
  if (!password) throw Error("Поле пароля не заполнено");
  const passwordHash = await hash(password, 10);
  const res = await pool
    .query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, passwordHash])
    .catch((e) => ({
      error: e,
    }));
  if (res.error) {
    throw Error(DB_ERROR[res.error.code] || "База данных вернула некорректный ответ");
  }
  const user = res.rows[0];
  const accessToken = generateJWT({ id: user.id }, ACCESS_SECRET_KEY, "1h");
  return { accessToken, user };
}

export async function login(email, password) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (!res.rows) throw Error("Пользователь не найден");
  const user = res.rows[0];
  const isPasswordMatch = await compare(password, user.password);

  if (!isPasswordMatch) throw Error("Неверный пароль");

  const accessToken = generateJWT({ id: user.id }, ACCESS_SECRET_KEY, "1h");

  return { accessToken, user };
}

export function getUsers() {
  return User.find();
}

export function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

export function updateUser(id, userData) {
  return User.findByIdAndUpdate(id, userData, { returnDocument: "after" });
}
