import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateJWT = ({ id, isdriver }, secret, expirationTime) =>
  jwt.sign(
    {
      id,
      isDriver: isdriver,
    },
    secret,
    { expiresIn: expirationTime }
  );

export const verifyToken = (token, secret) => jwt.verify(token, secret);
