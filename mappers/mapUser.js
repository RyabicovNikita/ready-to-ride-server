import { formatUTCDate } from "../helpers/index.js";

export const mapAuthUser = (user) => ({
  id: user.id,
  role: user.role,
  userName: user.first_name + " " + user.last_name ?? "",
  isDriver: user.isdriver,
  registed_at: formatUTCDate(user.created_at, "dd.MM.yyyy"),
  imageUrl: user.imageurl
});
export const mapFullInfoUser = (user) => ({
  email: user.email,
  role: user.role,
  registed_at: formatUTCDate(user.created_at, "dd.MM.yyyy"),
  birthday: user.birthday ? formatUTCDate(user.birthday, "yyyy-MM-dd") : null,
  firstName: user.first_name,
  lastName: user.last_name,
  imageUrl: user.imageurl,
  isDriver: user.isDriver,
  driverAuto: user.driverauto,
});
