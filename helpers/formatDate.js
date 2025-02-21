import { DateTime } from "luxon";

export const formatUTCDate = (UTCdate, format = "dd.LL.yyyy HH:mm:ss") => {
  return DateTime.fromISO(UTCdate.toISOString()).toFormat(format);
};
