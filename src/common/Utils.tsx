import { App, Trade } from '../redux/types';
import { algodClient } from '../algorand/utils/Utils';
import { extractAppState, extractManageAppState } from '../utils/Utils';

export enum FETCH_APPS_FILTER {
  ALL = 'all',
  UPCOMING = 'upcoming',
  SALE = 'sale',
  LIVE = 'live',
  EXPIRED = 'expired',
  ISSUER = 'issuer',
  GREEN_VERIFIER = 'green-verifier',
  FINANCIAL_REGULATOR = 'financial-regulator',
}

export async function fetchApps(
  accessToken: string,
  setApps: (apps: App[]) => void,
  filter: FETCH_APPS_FILTER,
  addr?: string,
): Promise<void> {
  try {
    // Fetch and parse
    const url: string = filter === FETCH_APPS_FILTER.ISSUER ||
    filter === FETCH_APPS_FILTER.GREEN_VERIFIER ||
    filter === FETCH_APPS_FILTER.FINANCIAL_REGULATOR  ?
      `https://igbob.herokuapp.com/apps/${filter}-apps/${addr}` :
      `https://igbob.herokuapp.com/apps/${filter}-apps`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const apps: App[] = await response.json();

    // Set global state of main and manage SSCs
    apps.forEach(app => {
      algodClient.getApplicationByID(app.app_id).do().then(mainApp => {
        app.app_global_state = extractAppState(mainApp.params['global-state']);
      });
      algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
        app.manage_app_global_state = extractManageAppState(manageApp.params['global-state']);
      })
    });

    setApps(apps);
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
  ALL = 'all',
  LIVE = 'live',
  EXPIRED = 'expired',
}

export enum FETCH_MY_TRADES_FILTER {
  MY_ALL = 'my-all',
  MY_LIVE = 'my-live',
  MY_SALE = 'my-expired',
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
