export interface App {
  appId: number,
  name: string,
  description: string,
  issuerAddr: string,
  bondId: number,
  bondEscrowAddr: string,
  stablecoinEscrowAddr: string,
  bondEscrowProg: string,
  stablecoinEscrowProg: string
}

interface BondState {
  apps: App[]
}

const initialState: BondState = {
  apps: []
};

export function bondReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_APPS": {
      const { apps } = action.payload;
      return {
        ...state,
        apps: apps
      };
    }
    default:
      return state;
  }
}
