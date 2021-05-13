import { App, AppState } from '../types';

export const appsSelector = state => state.bondReducer.apps;

export const getAppSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(appId);
};

export const getMainAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.app_global_state : undefined;
}

export const getTotCouponsPaidSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  if (!apps.has(appId)) return 0;

  const globalState: AppState | undefined = apps.get(appId)!.app_global_state;
  if (!globalState) return 0;

  return globalState.has("TotCouponsPayed") ? (globalState.get("TotCouponsPayed") as number) : 0;
}

export const getManageAppGlobalStateSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.has(appId) ? apps.get(appId)!.manage_app_global_state : undefined;
}
