import { App } from '../redux/types';

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