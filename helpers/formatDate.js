import { DateTime } from "luxon";

export const formatUTCDate = (UTCdate, format = "dd.MM.yyyy HH:mm:ss") => {
  return DateTime.fromJSDate(UTCdate).toFormat(format);
};
