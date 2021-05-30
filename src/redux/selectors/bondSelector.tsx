import { App, AppsTable } from '../types';

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

export const getMainAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.app_global_state : undefined;
}

export const getManageAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.manage_app_global_state : undefined;
}
