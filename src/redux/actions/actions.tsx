import { App } from '../reducers/bond';
import { UserAccount } from '../reducers/user';

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
