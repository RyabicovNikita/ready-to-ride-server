import { FORMATES_DATE } from "../constants/formatDates.js";
import { formatUTCDate } from "../helpers/index.js";

export const mapComment = (comment) => ({
  id: comment.id,
  text: comment.text,
  created_at: {
    date: formatUTCDate(comment.created_at, FORMATES_DATE.DATE),
    time: formatUTCDate(comment.created_at, FORMATES_DATE.SHORT_TIME),
  },
  parent: comment.parent_id,
  user: {
    id: comment.user_id,
    firstName: comment.first_name,
    lastName: comment.last_name,
    isDriver: comment.isdriver,
  },
});
