import { Router } from "express";
import { register, login } from "../controllers/index.js";
import { mapAuthUser } from "../helpers/mapUser.js";

const router = Router({ mergeParams: true });

router.post("/register", async (req, res) => {
  try {
    const { user, token } = await register(req.body.email, req.body.password);
    //Сразу логиним пользователя
    res.cookie("token", token, { httpOnly: true }).send({ user: mapAuthUser(user) });
  } catch (e) {
    res.send({ error: e.message || "Unknown error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { user, token } = await login(req.body.email, req.body.password);

    res.cookie("token", token, { httpOnly: true }).send({ user: mapAuthUser(user) });
  } catch (e) {
    res.send({ error: e.message || "Unknown error" });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true }).send({});
});

export default router;
