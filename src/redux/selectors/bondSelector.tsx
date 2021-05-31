import { App, AppsTable, Trade, TradesTable } from '../types';

export const appsSelector = state => state.bondReducer.apps;

export const appsTableSelector = state => {
  const apps: Map<number, App> = state.bondReducer.apps;

  const appsTable: AppsTable = Array.from(apps.values()).map((app: App) => {
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
    }
  });

  return appsTable;
};

export const getAppSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(appId);
};

export const tradesSelector = state => state.bondReducer.trades;

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

export const getManageAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.manage_app_global_state : undefined;
}
