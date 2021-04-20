interface IssuerState {
  addresses: string[];
}

const initialState: IssuerState = {
  addresses: []
};

export function issuerReducer(state = initialState, action: any) {
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
