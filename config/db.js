import { config } from "dotenv";
import pg from "pg";
const { Pool } = pg;

config();

export const pool = new Pool({
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  connectionString: `postgres://admin:Nikita_12345@db:5432/${process.env.DB_NAME}`
});
