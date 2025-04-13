import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);

// app.use(express.static("../ready-to-ride-client/build"));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve("..", "ready-to-ride-client", "build", "index.html"));
// });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
