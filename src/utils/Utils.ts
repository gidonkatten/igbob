/**
 * Convert from DateTime to Unix time
 */
export function convertDateToUnixTime(dateTime: string): number {
  return parseInt((new Date(dateTime).getTime() / 1000).toFixed(0));
}