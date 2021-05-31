export type AppState = Map<string, number | bigint | string | Uint8Array>;

export interface App {
  app_id: number,
  app_global_state?: AppState;
  manage_app_id: number,
  manage_app_global_state?: AppState;
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

export interface AppsTableElem {
  id: number,
  name: string,
  bond_id: number,
  bond_length: number,
  start_buy_date: Date,
  end_buy_date: Date,
  maturity_date: Date,
  bond_cost: number,
  bond_coupon: number,
  bond_principal: number,
}

export type AppsTable = AppsTableElem[];

export interface Trade {
  trade_id: number,
  app_id: number,
  bond_id: number,
  bond_escrow_address: string,
  bond_escrow_program: string,
  name: string,
  expiry_date: number,
  expiry_round: number,
  price: number,
  seller_address: string,
  lsig: Uint8Array,
  bond_length: number,
  maturity_date: number,
  bond_coupon: number,
  bond_principal: number,
}

export interface TradesTableElem {
  id: number,
  trade_id: number,
  bond_id: number,
  app_id: number,
  name: string,
  bond_length: number,
  maturity_date: Date,
  bond_coupon: number,
  bond_principal: number,
  expiry_date: Date,
  price: number,
  seller_address: string,
}

export type TradesTable = TradesTableElem[];
