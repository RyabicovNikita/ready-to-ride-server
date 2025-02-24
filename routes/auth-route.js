import { Router } from "express";
import { register, login } from "../controllers/index.js";
import { mapAuthUser } from "../mappers/mapUser.js";

const router = Router({ mergeParams: true });

router.post("/register", async (req, res) => {
  try {
    const { user, token } = await register({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      isDriver: req.body.isDriver,
    });

    //Сразу логиним пользователя
    res.cookie("token", token, { httpOnly: true }).send({ body: mapAuthUser(user) });
  } catch (e) {
    res.status(409).send({ error: e.message || "Unknown error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { user, token } = await login(req.body.email, req.body.password);

    res.cookie("token", token, { httpOnly: true }).send({ body: mapAuthUser(user) });
  } catch (e) {
    res.status(401).send({ error: e.message || "Unknown error" });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true }).send({});
});

export default router;
