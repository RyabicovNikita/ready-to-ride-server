import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addParentCommentInTrip } from "../controllers/index.js";
const router = Router({ mergeParams: true });

router.post("/", auth, async ({ body }, res) => {
  try {
    const newComment = await addParentCommentInTrip(body.tripID, body.userID, body.commentText);
    res.send({ body: newComment });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

export default router;
