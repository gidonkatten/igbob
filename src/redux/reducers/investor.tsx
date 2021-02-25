interface InvestorState {
  id: number
}

const initialState: InvestorState = {
  id: 0
};

export function investorReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_ID": {
      const { id } = action.payload;
      return {
        id: id
      };
    }
    default:
      return state;
  }
}
