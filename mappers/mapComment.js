import { formatUTCDate } from "../helpers/index.js";

export const mapComment = (comment) => ({
  id: comment.id,
  text: comment.text,
  created_at: formatUTCDate(comment.created_at),
  parent: comment.parent_id,
  user: {
    id: comment.user_id,
    firstName: comment.first_name,
    lastName: comment.last_name,
    isDriver: comment.isdriver,
  },
});
