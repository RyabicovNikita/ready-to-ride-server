import { config } from "dotenv";
import pg from "pg";
const { Pool } = pg;

config();

export const pool = new Pool();
