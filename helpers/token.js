import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateJWT = (userId, secret, expirationTime) =>
  jwt.sign(
    {
      userId,
    },
    secret,
    { expiresIn: expirationTime }
  );

export const verifyToken = (token, secret) => jwt.verify(token, secret);
