import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import routes from "./routes/index.js";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);

app.get("*", (req, res) => {
  res.sendFile(path.resolve("..", "ready-to-ride-client", "build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
