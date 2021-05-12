/**
 * Convert from DateTime to Unix time
 */
export function convertDateToUnixTime(dateTime: Date): number {
  return parseInt((dateTime.getTime() / 1000).toFixed(0));
}

/**
 * Convert from Unix time to DateTime
 */
export function convertUnixTimeToDate(unixTime: number): string {
  return new Date(unixTime * 1000).toDateString();
}

/**
 * Convert from Unix time to DateTime
 */
export function convertUnixTimeToTime(unixTime: number): string {
  return new Date(unixTime * 1000).toTimeString();
}

export const SIX_MONTH_PERIOD = 15768000;

/**
 * Format stablecoin
 */
export function formatStablecoin(amount: number): string {
  return (amount / 1e6).toFixed(6);
}
