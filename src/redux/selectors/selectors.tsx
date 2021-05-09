import { App } from '../reducers/bond';
import { AppLocalState, Asset } from '../reducers/user';
import { STABLECOIN_ID } from '../../algorand/utils/Utils';
import { getAssetBalance, getStablecoinBalance } from '../../algorand/balance/Balance';

export const addressesSelector = state => state.userReducer.addresses;

export const selectedAccountSelector = state => state.userReducer.selectedAccount;

export const optedIntoStablecoinSelector = state => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return false;

  const assets: Asset[] = selectedAcc.assets;
  return assets.some(asset => asset.assetId === STABLECOIN_ID);
};

export const stablecoinBalanceSelector = state => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return 0;

  return getStablecoinBalance(selectedAcc);
};

export const getOptedIntoBondSelector = state => bondId => {
  const assets: Asset[] = state.userReducer.selectedAccount.assets;
  return assets.some(asset => asset.assetId === bondId);
}

export const getBondBalanceSelector = state => bondId => {
  const selectedAcc = state.userReducer.selectedAccount
  if (!selectedAcc) return 0;

  return getAssetBalance(selectedAcc, bondId);
}

export const getOptedIntoAppSelector = state => appId => {
  const apps: AppLocalState[] = state.userReducer.selectedAccount.apps;
  return apps.some(app => app.appId === appId);
}

export const getCouponRoundsCollSelector = state => appId => {
  const apps: AppLocalState[] = state.userReducer.selectedAccount.apps;

  let coupons = 0;
  apps.forEach(app => {
    if (app.appId === appId) coupons = app.couponRoundsColl;
  })
  return coupons;
}

export const appsSelector = state => state.bondReducer.apps;

export const getAppSelector = state => appId => {
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(appId);
};
