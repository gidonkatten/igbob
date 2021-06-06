import { UserAccount } from '../types';

interface UserState {
  addresses: string[];
  selectedAccount?: UserAccount;
}

const initialState: UserState = {
  addresses: [],
};

export function userReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_ACCOUNT_ADDRESSES": {
      const { addresses } = action.payload;
      return {
        ...state,
        addresses: addresses
      };
    }
    case "SET_SELECTED_ACCOUNT": {
      const { account } = action.payload;
      return {
        ...state,
        selectedAccount: account
      };
    }
    default:
      return state;
  }
}
