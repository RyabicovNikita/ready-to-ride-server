export const mapAuthUser = (user) => ({ id: user.id, role_id: user.role, registed_at: user.created_at });
export const mapCardUser = (user) => ({
  email: user.email,
  role_id: user.role,
  registed_at: user.created_at,
  image: user.imageurl,
  isDriver: user.isDriver,
  tripsCount: tripscount,
  driverauto: user.driverauto,
});
