export const hasRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.send({ error: "Access denied" });
      return;
    }
    next();
  };
