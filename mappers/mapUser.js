import { formatUTCDate } from "../helpers/index.js";

export const mapAuthUser = (user) => ({
  id: user.id,
  role: user.role,
  userName: user.first_name + " " + user.last_name ?? "",
  isDriver: user.isdriver,
  registed_at: formatUTCDate(user.created_at, "dd.MM.yyyy"),
});
export const mapCardUser = (user) => ({
  email: user.email,
  role: user.role,
  login: user.login,
  registed_at: formatUTCDate(user.created_at, "dd.MM.yyyy"),
  image: user.imageurl,
  isDriver: user.isDriver,
  tripsCount: tripscount,
  driverauto: user.driverauto,
});
