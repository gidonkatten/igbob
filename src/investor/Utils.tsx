import { App } from '../redux/types';

export interface CouponRound {
  round: number,
  date: number
}

export interface Defaulted {
  round: number,
  owedAtRound: number,
  isDueToPrincipal: boolean // Used for special case where can afford to pay all coupons but not principal
}

// Returns 0 if none, and bondLength if finished
// Else returns round rounded down
export function getCouponRound(app: App): CouponRound {
  const {
    end_buy_date,
    maturity_date,
    period,
    bond_length,
  } = app;
  const currentTime: number = Date.now() / 1000;

  let round: number;
  if (currentTime < end_buy_date) round = 0;
  else if (currentTime > maturity_date) round = bond_length;
  else round = Math.floor((currentTime - end_buy_date) / period);

  const date = end_buy_date + round * period;

  return { round, date };
}

// Returns undefined if invalid time
// Else returns round: 0 is use of proceeds and 0 < n <= no.coupons is coupon round
export function getReportRatingRound(app: App): number | undefined {
  const {
    start_buy_date,
    end_buy_date,
    maturity_date,
    period
  } = app;
  const currentTime: number = Date.now() / 1000;

  let round: number | undefined;

  if (currentTime < start_buy_date) {
    // Use of proceeds must be before bond is bought
    round = 0;
  } else if (currentTime >= end_buy_date && currentTime < maturity_date) {
    round = Math.ceil((currentTime - end_buy_date) / period);
  }
  // Undefined if between startBuyDate and endBuyDate
  // Undefined if after maturityDate

  return round;
}

// Returns app state value - 0 if key doesn't exist
export function getStateValue(key: string, state?: Map<string, any>) {
  if (!state) return 0;

  if (state.has(key)) {
    return state.get(key);
  } else {
    return 0;
  }
}

// Returns rating - 0 if key doesn't exist
export function getRatingFromState(round: number, state?: Map<string, any>): number {
  if (!state) return 0;
  return getStateValue('ratings', state)[round];
}

// Returns ratings - 0 if key doesn't exist
export function getRatingsFromState(app: App): number[] {
  return getStateValue('ratings', app.app_global_state);
}

export function getMultiplier(rating: number): number {
  const penalty: number = rating === 0 ? 0 : 5 - rating;
  return 1.1 ** penalty;
}

// Returns round and money owed then if defaulted
// Returns undefined if has not defaulted
export function getHasDefaulted(app: App): Defaulted | undefined {
  const {
    app_global_state,
    maturity_date,
    bond_coupon,
    bond_principal,
    bond_length,
    coupon_round,
    bonds_minted,
    bond_escrow_balance,
    stablecoin_escrow_balance,
  } = app;
  if (!coupon_round ||
    bonds_minted === undefined ||
    bond_escrow_balance === undefined ||
    stablecoin_escrow_balance === undefined
  ) return undefined;

  const globalCouponRoundsPaid: number = getStateValue("coupons_paid", app_global_state);
  const reserve: number = getStateValue( "reserve", app_global_state);

  // Not defaulted if have already started paying out the curr round
  if (globalCouponRoundsPaid === coupon_round.round && globalCouponRoundsPaid !== bond_length) return undefined;

  const currentTime: number = Date.now() / 1000;

  const numBondsInCirculation = bonds_minted - bond_escrow_balance;

  let round = globalCouponRoundsPaid + 1;
  let totalOwed: number = reserve;
  for (; round <= coupon_round.round; round++) {
    const rating = getRatingFromState(round, app_global_state);
    const multiplier = getMultiplier(rating);
    totalOwed += Math.floor(bond_coupon * multiplier) * numBondsInCirculation;
    if (totalOwed > stablecoin_escrow_balance) {
      return {
        round,
        owedAtRound: totalOwed,
        isDueToPrincipal: false
      }
    }
  }

  if (currentTime >= maturity_date) {
    totalOwed += bond_principal * numBondsInCirculation;
    if (totalOwed > stablecoin_escrow_balance) {
      return {
        round,
        owedAtRound: totalOwed,
        isDueToPrincipal: true
      }
    }
  }

  // Can afford to pay everything
  return undefined;
}
