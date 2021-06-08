import { CouponRound, Defaulted } from '../investor/Utils';

export type AppState = Map<string, number | bigint | string | Uint8Array>;

export interface UserAccount {
  address: string;
  algoBalance: number | bigint;
  assets: Map<number, number | bigint>; // assetId -> amount
  appsLocalState: Map<number, AppState>; // appId -> localStateKey -> localStateValue
}

export interface AppAccount {
  addr: string,
  balance: number,
  frozen: boolean,
}

export interface App {
  app_id: number;
  app_global_state?: AppState;
  manage_app_id: number;
  manage_app_global_state?: AppState;
  name: string;
  description: string;
  issuer_address: string;
  green_verifier_address: string;
  bond_id: number;
  bond_length: number;
  period: number;
  start_buy_date: number;
  end_buy_date: number;
  maturity_date: number;
  bond_cost: number;
  bond_coupon: number;
  bond_principal: number;
  bonds_minted?: number;
  bond_escrow_address: string;
  bond_escrow_program: string;
  bond_escrow_balance?: number;
  stablecoin_escrow_address: string;
  stablecoin_escrow_program: string;
  stablecoin_escrow_balance?: number;
  coupon_round?: CouponRound;
  defaulted?: Defaulted;
}

export interface AppsTableElem {
  id: number;
  name: string;
  bond_id: number;
  bond_length: number;
  start_buy_date: Date;
  end_buy_date: Date;
  maturity_date: Date;
  bond_cost: number;
  bond_coupon: number;
  bond_principal: number;
  bonds_available: number;
  bonds_minted: number;
  coupon_round: number;
  stablecoin_escrow_balance: number;
  defaulted: boolean;
  frozen: boolean;
  use_of_proceeds_rating: number;
  recent_rating: number;
}

export type AppsTable = AppsTableElem[];

export interface Trade {
  trade_id: number;
  app_id: number;
  bond_id: number;
  bond_escrow_address: string;
  bond_escrow_program: string;
  name: string;
  expiry_date: number;
  expiry_round: number;
  price: number;
  seller_address: string;
  lsig: Uint8Array;
  lsig_program: string;
  bond_length: number;
  maturity_date: number;
  bond_coupon: number;
  bond_principal: number;
  seller_balance?: number;
  seller_frozen?: boolean;
}

export interface TradesTableElem {
  id: number;
  trade_id: number;
  bond_id: number;
  app_id: number;
  name: string;
  bond_length: number;
  maturity_date: Date;
  bond_coupon: number;
  bond_principal: number;
  expiry_date: Date;
  price: number;
  seller_address: string;
  seller_balance: number;
  seller_frozen: boolean;
}

export type TradesTable = TradesTableElem[];
