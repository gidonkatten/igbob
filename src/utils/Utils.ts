/**
 * Convert from DateTime to Unix time
 */
export function convertDateToUnixTime(dateTime: string): number {
  return parseInt((new Date(dateTime).getTime() / 1000).toFixed(0));
}

/**
 * Convert from Unix time to DateTime
 */
export function convertUnixTimeToDate(unixTime: number): string {
  return new Date(unixTime * 1000).toDateString();
}

export const SIX_MONTH_PERIOD = 15768000;

/**
 * Format stablecoin
 */
export function formatStablecoin(amount: number): string {
  return (amount / 1e6).toFixed(6);
}
