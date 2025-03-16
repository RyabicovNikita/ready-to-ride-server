export const hasRole =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      res.send({ error: "Access denied" });
      return;
    }
    next();
  };
