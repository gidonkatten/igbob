interface InvestorState {
  addresses: string[];
}

const initialState: InvestorState = {
  addresses: []
};

export function investorReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_ACCOUNT_ADDRESSES": {
      const { addresses } = action.payload;
      return {
        ...state,
        addresses: addresses
      };
    }
    default:
      return state;
  }
}
