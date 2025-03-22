import { DateTime } from "luxon";

export const formatUTCDate = (UTCdate, format = "dd.MM.yyyy HH:mm:ss") => {
  return DateTime.fromJSDate(UTCdate).toFormat(format);
};

export function sortArrByCreateDate(array) {
  if (!Array.isArray(array)) return [];

  return [...array].sort((a, b) => {
    const dateA = formatUTCDate(a.created_at);
    const dateB = formatUTCDate(b.created_at);
    return dateB - dateA;
  });
}
