import { formatUTCDate } from "../helpers/index.js";

export const mapComment = (comment) => ({
  id: comment.id,
  text: comment.text,
  created_at: formatUTCDate(trip.created_at),
  parent: comment.parent_id,
});
