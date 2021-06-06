import { STABLECOIN_ID } from '../../algorand/utils/Utils';
import { getAssetBalance, getStablecoinBalance } from '../../algorand/account/Account';
import { AppState } from '../types';
import { getStateValue } from '../../investor/Utils';

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
  const appsLocalState: Map<number, AppState> = state.userReducer.selectedAccount.appsLocalState;
  return appsLocalState.has(appId);
}

export const getAppLocalStateSelector = state => appId => {
  const appsLocalState: Map<number, AppState> = state.userReducer.selectedAccount.appsLocalState;
  return appsLocalState.has(appId) ? appsLocalState.get(appId)! : undefined;
}

export const getAppLocalCouponRoundsPaidSelector = state => appId => {
  const appsLocalState: Map<number, AppState> = state.userReducer.selectedAccount.appsLocalState;

  if (!appsLocalState.has(appId)) return 0;

  const localState: AppState = appsLocalState.get(appId)!;
  return getStateValue("CouponsPaid", localState);
}

export const getAppLocalTradeSelector = state => appId => {
  const appsLocalState: Map<number, AppState> = state.userReducer.selectedAccount.appsLocalState;

  if (!appsLocalState.has(appId)) return 0;

  const localState: AppState = appsLocalState.get(appId)!;
  return getStateValue("Trade", localState);
}

export const getAppLocalFrozenSelector = state => appId => {
  const appsLocalState: Map<number, AppState> = state.userReducer.selectedAccount.appsLocalState;

  if (!appsLocalState.has(appId)) return true;

  const localState: AppState = appsLocalState.get(appId)!;
  return getStateValue("Trade", localState) === 0;
}

