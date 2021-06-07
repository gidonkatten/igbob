import { App, AppState, Trade, UserAccount } from '../types';

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

export const setAppBondEscrowBalance = (appId: number, balance: number) => ({
  type: "SET_APP_BOND_ESCROW_BALANCE",
  payload: { appId, balance }
});

export const setAppStablecoinEscrowBalance = (appId: number, balance: number) => ({
  type: "SET_APP_STABLECOIN_ESCROW_BALANCE",
  payload: { appId, balance }
});

export const setTrades = (trades: Trade[]) => ({
  type: "SET_TRADES",
  payload: { trades }
});

export const setTradeAvailableBalance = (tradeId: number, balance: number, frozen: boolean) => ({
  type: "SET_TRADE_AVAILABLE_BALANCE",
  payload: { tradeId, balance, frozen }
});

export const setMainAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MAIN_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

export const setManageAppGlobalState = (appId: number | bigint, state: AppState) => ({
  type: "SET_MANAGE_APP_GLOBAL_STATE",
  payload: { appId, appState: state }
});

