import { Asset } from '../reducers/user';
import { STABLECOIN_ID } from '../../algorand/utils/Utils';

export const addressesSelector = state => state.userReducer.addresses;

export const selectedAccountSelector = state => state.userReducer.selectedAccount;

export const optedIntoStablecoinSelector = state => {
  const assets: Asset[] = state.userReducer.selectedAccount.assets;
  return assets.some(asset => asset.assetId === STABLECOIN_ID);
};

export const stablecoinBalanceSelector = state => {
  let stablecoinBalance = 0;
  state.userReducer.selectedAccount.assets.forEach(asset => {
    if (asset.assetId === STABLECOIN_ID) {
      stablecoinBalance = asset.amount / 1e6;
    }
  })
  return stablecoinBalance;
};

export const appsSelector = state => state.bondReducer.apps;
