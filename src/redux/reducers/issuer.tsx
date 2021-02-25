interface IssuerState {
  id: number
}

const initialState: IssuerState = {
  id: 0
};

export function issuerReducer(state = initialState, action: any) {
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
