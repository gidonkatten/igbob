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
  apps: Map<number, App>,
}

const initialState: BondState = {
  apps: new Map<number, App>()
};

export function bondReducer(state = initialState, action: any) {
  switch (action.type) {
    case "SET_APPS": {
      const { apps } = action.payload;
      const appsMap = new Map<number, App>(apps.map(app => [app.app_id, app]));
      return {
        ...state,
        apps: appsMap
      };
    }
    default:
      return state;
  }
}
