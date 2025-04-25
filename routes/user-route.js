import { Router } from "express";

import { getUser, updateUser } from "../controllers/index.js";
import auth from "../middlewares/auth.js";
import { IncomingForm } from "formidable";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router({ mergeParams: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get("/:id", auth, async (req, res) => {
  try {
    const userData = await getUser(req.params.id);
    res.send({ body: userData });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  const form = new IncomingForm({
    uploadDir: path.join("uploads"),
    keepExtensions: true,
  });

  const userID = req.params.id;

  form.on("fileBegin", (name, file) => {
    const extname = path.extname(file.originalFilename);
    const newFileName = `user-${userID}-profile-${Date.now()}${extname}`;

    file.filepath = path.join(form.uploadDir, newFileName);
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(400).send("Error uploading file");
    }
    const filePath = files.imageFile ? files.imageFile[0].filepath : null;
    const relativeFilePath = filePath
      ? filePath.replace(/^.*[\\\/]uploads[\\\/]/, "/uploads/") // Преобразуем абсолютный путь в относительный
      : null;
    try {
      const userData = await getUser(userID);
      if (userData.imageUrl && userData.imageUrl !== relativeFilePath) {
        const oldImagePath = path.join(__dirname, "..", userData.imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Ошибка при удалении старой фотографии:", err);
          }
        });
      }

      const updatedUser = await updateUser({
        id: userID,
        firstName: fields.firstName?.[0],
        lastName: fields.lastName?.[0],
        birthday: fields.birthday?.[0],
        driverAuto: fields.driverAuto?.[0],
        imageURL: relativeFilePath,
      });
      res.send({ body: updatedUser });
    } catch (e) {
      res.status(500).send({ error: e.message });
    }
  });
});

export default router;
