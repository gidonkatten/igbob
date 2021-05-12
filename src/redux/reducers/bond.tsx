export interface App {
  app_id: number,
  manage_app_id: number,
  name: string,
  description: string,
  issuer_address: string,
  green_verifier_address: string,
  bond_id: number,
  bond_escrow_address: string,
  stablecoin_escrow_address: string,
  bond_escrow_program: string,
  stablecoin_escrow_program: string,
  bond_length: number,
  period: number,
  start_buy_date: number,
  end_buy_date: number,
  maturity_date: number,
  bond_cost: number,
  bond_coupon: number,
  bond_principal: number,
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
