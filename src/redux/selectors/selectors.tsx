import { App } from '../reducers/bond';
import { STABLECOIN_ID } from '../../algorand/utils/Utils';
import { getAssetBalance, getStablecoinBalance } from '../../algorand/account/Account';

export const addressesSelector = state => state.userReducer.addresses;

export const selectedAccountSelector = state => state.userReducer.selectedAccount;

export const optedIntoStablecoinSelector = state => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return false;

  const assets: Map<number, number> = selectedAcc.assets;
  return assets.has(STABLECOIN_ID);
};

export const stablecoinBalanceSelector = state => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return 0;

  return getStablecoinBalance(selectedAcc);
};

export const getOptedIntoBondSelector = state => bondId => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return false;

  const assets: Map<number, number> = selectedAcc.assets;
  return assets.has(bondId);
}

export const getBondBalanceSelector = state => bondId => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return 0;

  return getAssetBalance(selectedAcc, bondId);
}

export const getOptedIntoAppSelector = state => appId => {
  const apps: Map<number, Map<string, number | bigint  | string>> = state.userReducer.selectedAccount.apps;
  return apps.has(appId);
}

export const getAppLocalStateSelector = state => appId => {
  const apps: Map<number, Map<string, number | bigint | string>> = state.userReducer.selectedAccount.apps;
  return apps.get(appId);
}

export const getCouponRoundsPaidSelector = state => appId => {
  const apps: Map<number, Map<string, number | bigint | string>> = state.userReducer.selectedAccount.apps;

  if (!apps.has(appId)) return 0;

  const localState: Map<string, number | bigint | string> = apps.get(appId)!;
  return localState.has("CouponsPayed") ? (localState.get("CouponsPayed") as number) : 0;
}

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

export const getTotCouponsPaidSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  if (!apps.has(appId)) return 0;

  const globalState: Map<string, number | bigint | string> | undefined = apps.get(appId)!.app_global_state;
  if (!globalState) return 0;

  return globalState.has("TotCouponsPayed") ? (globalState.get("TotCouponsPayed") as number) : 0;
}
