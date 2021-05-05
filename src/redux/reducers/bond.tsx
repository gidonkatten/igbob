export interface App {
  app_id: number,
  name: string,
  description: string,
  issuer_address: string,
  bond_id: number,
  bond_escrow_address: string,
  stablecoin_escrow_address: string,
  bond_escrow_program: string,
  stablecoin_escrow_program: string,
  bond_length: number,
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
      const appsMap = new Map<number, App>(apps.map(app => {
        const formattedBondCost = app.bond_cost / 1e6;
        const formattedBondCoupon = app.bond_coupon / 1e6;
        const formattedBondPrincipal = app.bond_principal / 1e6;
        const formattedApp = {
          ...app,
          bond_cost: formattedBondCost,
          bond_coupon: formattedBondCoupon,
          bond_principal: formattedBondPrincipal,
        }
        return [app.app_id, formattedApp];
      }));
      return {
        ...state,
        apps: appsMap
      };
    }
    default:
      return state;
  }
}
