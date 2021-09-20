import { App, AppsTable, Trade, TradesTable } from '../types';
import { getRatingsFromState, getStateValue } from '../../investor/Utils';

export const appsSelector = state => state.bondReducer.apps;

export const appsTableSelector = state => {
  const apps: Map<number, App> = state.bondReducer.apps;

  const appsTable: AppsTable = Array.from(apps.values()).map((app: App) => {
    const round: number = !app.coupon_round ? 0 : app.coupon_round.round;
    const ratings: number[] = getRatingsFromState(app);

    return {
      id: app.app_id,
      name: app.name,
      bond_id: app.bond_id,
      bond_length: app.bond_length,
      start_buy_date: new Date(app.start_buy_date * 1000),
      end_buy_date: new Date(app.end_buy_date * 1000),
      maturity_date: new Date(app.maturity_date * 1000),
      bond_cost: app.bond_cost,
      bond_coupon: app.bond_coupon,
      bond_principal: app.bond_principal,
      bonds_available: app.bond_escrow_balance === undefined ? 0 : app.bond_escrow_balance,
      bonds_minted: app.bonds_minted === undefined ? 0 : app.bonds_minted,
      coupon_round: round,
      stablecoin_escrow_balance: app.stablecoin_escrow_balance === undefined ? 0 : app.stablecoin_escrow_balance,
      defaulted: app.defaulted !== undefined,
      frozen: getStateValue('frozen', app.app_global_state) === 0,
      use_of_proceeds_rating: ratings[0],
      recent_rating: ratings.length > round ? ratings[round] : 0,
    }
  });

  return appsTable;
};

export const getAppSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(appId);
};

export const getAppFilesSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  const app: App | undefined = apps.get(appId);
  if (!app) return [];
  return app.cids ? app.cids : [];
};

export const selectedAppSelector = state => {
  const selected: number | undefined = state.bondReducer.selectedApp;
  if (!selected) return undefined;

  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(selected);
};

export const tradesSelector = state => state.bondReducer.trades;

export const selectedTradeSelector = state => {
  const selected: number | undefined = state.bondReducer.selectedTrade;
  if (!selected) return undefined;

  const trades: Map<number, Trade> = state.bondReducer.trades;
  return trades.get(selected);
};

export const tradesTableSelector = state => {
  const trades: Map<number, Trade> = state.bondReducer.trades;

  const tradesTable: TradesTable = Array.from(trades.values()).map((trade: Trade) => {
    return {
      id: trade.trade_id,
      trade_id: trade.trade_id,
      bond_id: trade.bond_id,
      app_id: trade.app_id,
      name: trade.name,
      bond_length: trade.bond_length,
      maturity_date: new Date(trade.maturity_date * 1000),
      bond_coupon: trade.bond_coupon,
      bond_principal: trade.bond_principal,
      expiry_date: new Date(trade.expiry_date * 1000),
      price: trade.price,
      seller_address: trade.seller_address,
      seller_balance: trade.seller_balance === undefined ? 0 : trade.seller_balance,
      seller_frozen: trade.seller_frozen === undefined || trade.seller_frozen,
    }
  });

  return tradesTable;
};

export const getTradesSelector = state => tradeId => {
  const trades: Map<number, Trade> = state.bondReducer.trades;
  return trades.get(tradeId);
};

export const getMainAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.app_global_state : undefined;
}
