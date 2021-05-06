import { App } from '../reducers/bond';
import { Asset } from '../reducers/user';
import { STABLECOIN_ID } from '../../algorand/utils/Utils';

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

  let balance = 0;
  state.userReducer.selectedAccount.assets.forEach(asset => {
    if (asset.assetId === STABLECOIN_ID) {
      balance = asset.amount;
    }
  })
  return balance;
};

export const getOptedIntoBondSelector = state => bondId => {
  const assets: Asset[] = state.userReducer.selectedAccount.assets;
  return assets.some(asset => asset.assetId === bondId);
}

export const getBondBalanceSelector = state => bondId => {
  let balance = 0;
  state.userReducer.selectedAccount.assets.forEach(asset => {
    if (asset.assetId === bondId) {
      balance = asset.amount;
    }
  })
  return balance;
}

export const appsSelector = state => state.bondReducer.apps;

export const getAppSelector = state => appId => {
  if (!appId) return undefined;
  const apps: Map<number, App> = state.bondReducer.apps;
  return apps.get(appId);
};
