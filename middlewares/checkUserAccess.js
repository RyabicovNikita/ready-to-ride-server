import { PASS_BREADCRUMBS, DRIVER_BREADCRUMBS } from "../constants/index.js";
import { ERRORS } from "../constants/errors.js";
import { verifyToken } from "../helpers/token.js";

const ACCESS_SECRET_KEY = process.env.ACCESS_TOKEN;

function checkUserAccess(breadcrumb) {
  return (req, res, next) => {
    if (!req.cookies.token) {
      res.send({ error: ERRORS.NOT_AUTH });
      return;
    }

    try {
      const tokenData = verifyToken(req.cookies.token, ACCESS_SECRET_KEY);

      if (!tokenData.id) {
        res.send({ error: ERRORS.NOT_AUTH });
        return;
      }
      if (Object.values(PASS_BREADCRUMBS).includes(breadcrumb) && tokenData.isDriver) {
        res.status(500).send({ error: "Данное действие доступно только пассажирам" });
        return;
      }
      if (Object.values(DRIVER_BREADCRUMBS).includes(breadcrumb) && !tokenData.isDriver) {
        res.status(500).send({ error: "Данное действие доступно только пассажирам" });
        return;
      }
    } catch (e) {
      res.send({ error: e.message });
      return;
    }

    next();
  };
}

export default checkUserAccess;
