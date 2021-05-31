import { TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types';
import { AppState } from '../redux/types';

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

/**
 * Format stablecoin
 */
export function formatAlgoDecimalNumber(amount: number | bigint): string {
  return (amount as number / 1e6).toFixed(6);
}

/**
 * Extract app state given TealKeyValue[]
 */
export function extractAppState(state?: TealKeyValue[] | undefined): AppState {
  const map: AppState = new Map();

  if (state) {
    // Check if has a state
    if (state) {
      state.forEach(pair => {
        const key: string = atob(pair.key);
        let value: number | bigint | string;
        if (pair.value.type === 1) value = atob(pair.value.bytes);
        else value = pair.value.uint;
        map.set(key, value);
      })
    }
  }

  return map;
}

/**
 * Extract app state given TealKeyValue[]
 */
export function extractManageAppState(state?: TealKeyValue[] | undefined): AppState {
  const map: AppState = new Map();

  if (state) {
    // Check if has a state
    if (state) {
      state.forEach(pair => {
        const key: Uint8Array = Uint8Array.from(atob(pair.key), c => c.charCodeAt(0));
        const value: Uint8Array = Uint8Array.from(atob(pair.value.bytes), c => c.charCodeAt(0));
        map.set(key[0] + '', value);
      })
    }
  }

  return map;
}
