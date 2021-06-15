import { App, AppFiles, AppState, Trade, UserAccount } from '../types';
import { Defaulted } from '../../investor/Utils';

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

export const clearSelectedApp = () => ({
  type: "CLEAR_SELECTED_APP"
});

export const setSelectedApp = (appId: number) => ({
  type: "SET_SELECTED_APP",
  payload: { appId }
});

export const setAppBondEscrowBalance = (appId: number, balance: number) => ({
  type: "SET_APP_BOND_ESCROW_BALANCE",
  payload: { appId, balance }
});

export const setAppStablecoinEscrowBalance = (appId: number, balance: number) => ({
  type: "SET_APP_STABLECOIN_ESCROW_BALANCE",
  payload: { appId, balance }
});

export const setAppDefaulted = (appId: number, defaulted?: Defaulted) => ({
  type: "SET_APP_DEFAULTED",
  payload: { appId, defaulted }
});

export const setAppFiles = (appId: number, files?: AppFiles) => ({
  type: "SET_APP_FILES",
  payload: { appId, files }
});

export const setMainAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MAIN_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

export const setManageAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MANAGE_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

export const setTrades = (trades: Trade[]) => ({
  type: "SET_TRADES",
  payload: { trades }
});

export const clearSelectedTrade  = () => ({
  type: "CLEAR_SELECTED_TRADE"
});

export const setSelectedTrade = (tradeId: number) => ({
  type: "SET_SELECTED_TRADE",
  payload: { tradeId }
});

export const setTradeAvailableBalance = (tradeId: number, balance: number, frozen: boolean) => ({
  type: "SET_TRADE_AVAILABLE_BALANCE",
  payload: { tradeId, balance, frozen }
});

