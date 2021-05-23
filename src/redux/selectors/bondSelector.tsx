import { App } from '../types';

export const appsSelector = state => state.bondReducer.apps;

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
