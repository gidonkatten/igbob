interface InvestorState {
  addresses: string[];
  selectedAddress?: string;
}

const initialState: InvestorState = {
  addresses: []
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
    case "SET_SELECTED_ADDRESS": {
      const { address } = action.payload;
      return {
        ...state,
        selectedAddress: address
      };
    }
    default:
      return state;
  }
}
