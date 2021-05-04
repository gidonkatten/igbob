export interface App {
  app_id: number,
  name: string,
  description: string,
  issuer_address: string,
  bond_id: number,
  bond_escrow_address: string,
  stablecoin_escrow_address: string,
  bond_escrow_program: string,
  stablecoin_escrow_program: string
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
