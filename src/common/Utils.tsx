import { App, Trade } from '../redux/types';
import { setTrades } from '../redux/actions/actions';

export enum FETCH_APPS_FILTER {
  ALL = 'all',
  UPCOMING = 'upcoming',
  SALE = 'sale',
  LIVE = 'live',
  EXPIRED = 'expired',
  ISSUER = 'issuer',
  GREEN_VERIFIER = 'green-verifier',
}

export async function fetchApps(
  accessToken: string,
  setApps: (apps: App[]) => void,
  filter: FETCH_APPS_FILTER,
  addr?: string,
): Promise<void> {
  try {
    const url: string = filter === FETCH_APPS_FILTER.ISSUER || filter === FETCH_APPS_FILTER.GREEN_VERIFIER ?
      `https://igbob.herokuapp.com/apps/${filter}-apps/${addr}` :
      `https://igbob.herokuapp.com/apps/${filter}-apps`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const parseResponse = await response.json();
    setApps(parseResponse);
  } catch (err) {
    console.error(err.message);
  }
}

export async function fetchApp(
  accessToken: string,
  setApp: (app: App) => void,
  app_id: number,
): Promise<void> {
  try {
    const response = await fetch(`https://igbob.herokuapp.com/apps/app/${app_id}`, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const parseResponse = await response.json();
    setApp(parseResponse);
  } catch (err) {
    console.error(err.message);
  }
}

export enum FETCH_TRADES_FILTER {
  ALL = 'all-trades',
  LIVE = 'live-trades',
  EXPIRED = 'expired-trades',
}

export enum FETCH_MY_TRADES_FILTER {
  MY_ALL = 'my-all-trades',
  MY_LIVE = 'my-live-trades',
  MY_SALE = 'my-expired-trades',
}

export async function fetchTrades(
  accessToken: string,
  setTrades: (trades: Trade[]) => void,
  filter: FETCH_TRADES_FILTER | FETCH_MY_TRADES_FILTER,
): Promise<void> {
  try {
    const response = await fetch(`https://igbob.herokuapp.com/trades/${filter}-trades`, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const parseResponse = await response.json();
    setTrades(parseResponse);
  } catch (err) {
    console.error(err.message);
  }
}
