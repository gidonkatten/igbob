import { App, Trade } from '../redux/types';
import { algodClient, indexerClient } from '../algorand/utils/Utils';
import { extractAppState, extractManageAppState } from '../utils/Utils';
import {
  getAccountInformation,
  getAppAccountTrade,
  getAssetBalance,
  getStablecoinBalance
} from '../algorand/account/Account';
import { getCouponRound, getHasDefaulted } from '../investor/Utils';

export enum BondStatus {
  SALE,
  ONGOING,
  EXPIRED,
}

export enum FetchAppsFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  SALE = 'sale',
  LIVE = 'live',
  EXPIRED = 'expired',
  ISSUER = 'issuer',
  GREEN_VERIFIER = 'green-verifier',
  FINANCIAL_REGULATOR = 'financial-regulator',
}

async function updateApp(app: App) {
  app.coupon_round = getCouponRound(app);

  // Set ssc states, minted, balances and default
  await Promise.all(
    [
      algodClient.getApplicationByID(app.app_id).do(),
      algodClient.getApplicationByID(app.manage_app_id).do(),
      indexerClient.lookupAssetByID(app.bond_id).do(),
      getAccountInformation(app.bond_escrow_address),
      getAccountInformation(app.stablecoin_escrow_address)
    ]
  ).then(([mainApp, manageApp, asset, bondEscrow, stablecoinEscrow]) => {
    app.app_global_state = extractAppState(mainApp.params['global-state']);
    app.manage_app_global_state = extractManageAppState(manageApp.params['global-state']);
    app.bonds_minted = asset.asset.params.total as number;
    app.bond_escrow_balance = getAssetBalance(bondEscrow, app.bond_id) as number;
    app.stablecoin_escrow_balance = getStablecoinBalance(stablecoinEscrow) as number;
    app.defaulted = getHasDefaulted(app);
  });

  return app;
}

export async function fetchApps(
  accessToken: string,
  setApps: (apps: App[]) => void,
  filter: FetchAppsFilter,
  addr?: string,
): Promise<void> {
  try {
    // Fetch and parse
    const url: string = filter === FetchAppsFilter.ISSUER ||
    filter === FetchAppsFilter.GREEN_VERIFIER ||
    filter === FetchAppsFilter.FINANCIAL_REGULATOR  ?
      `https://igbob.herokuapp.com/apps/${filter}-apps/${addr}` :
      `https://igbob.herokuapp.com/apps/${filter}-apps`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const parsedResponse = await response.json();

    const apps = parsedResponse.map(async app => {
      await updateApp(app);
      return app;
    });

    setApps(await Promise.all(apps));
  } catch (err) {
    console.error(err.message);
  }
}

export async function fetchApp(
  accessToken: string,
  app_id: number,
): Promise<App | undefined> {
  try {
    const response = await fetch(`https://igbob.herokuapp.com/apps/app/${app_id}`, {
      headers: { Authorization: `Bearer ${accessToken}`},
    });
    const parsedResponse = await response.json();

    return parsedResponse;
  } catch (err) {
    console.error(err.message);
    return undefined;
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
    const parsedResponse = await response.json();

    // Set balance and frozen
    const trades = parsedResponse.map(async trade => {
      const appAccountTrade = await getAppAccountTrade(
        trade.seller_address,
        trade.app_id,
        trade.bond_id
      );
      return {
        ...trade,
        seller_balance: appAccountTrade.balance,
        seller_frozen: appAccountTrade.frozen,
      }
    });

    setTrades(await Promise.all(trades));
  } catch (err) {
    console.error(err.message);
  }
}
