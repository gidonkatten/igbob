import { UserAccount } from '../reducers/userReducer';
import { App, AppState, Trade } from '../types';

export const setAccountAddresses = (addresses: string[]) => ({
  type: "SET_ACCOUNT_ADDRESSES",
  payload: { addresses }
});

export const setSelectedAccount = (account: UserAccount) => ({
  type: "SET_SELECTED_ACCOUNT",
  payload: { account }
});

export const setApps = (apps: App[]) => ({
  type: "SET_APPS",
  payload: { apps }
});

export const setTrades = (trades: Trade[]) => ({
  type: "SET_TRADES",
  payload: { trades }
});

export const setMainAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MAIN_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

export const setManageAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MANAGE_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

