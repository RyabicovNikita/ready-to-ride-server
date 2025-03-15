import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateJWT = ({ id, isdriver, role }, secret, expirationTime) =>
  jwt.sign(
    {
      id,
      isDriver: isdriver,
      role,
    },
    secret,
    { expiresIn: expirationTime }
  );

export const verifyToken = (token, secret) => jwt.verify(token, secret);
