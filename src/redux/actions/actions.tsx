import { App } from '../reducers/bond';

export const setAccountAddresses = (addresses: string[]) => ({
  type: "SET_ACCOUNT_ADDRESSES",
  payload: { addresses }
});

export const setSelectedAddress = (address: string) => ({
  type: "SET_SELECTED_ADDRESS",
  payload: { address }
});

export const setApps = (apps: App) => ({
  type: "SET_APPS",
  payload: { apps }
});
