import { App, AppState } from '../redux/types';

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
export function getCouponRound(
  endBuyDate: number,
  maturityDate: number,
  period: number,
  bondLength: number
): CouponRound {
  const currentTime: number = Date.now() / 1000;

  let round: number;
  if (currentTime < endBuyDate) round = 0;
  else if (currentTime > maturityDate) round = bondLength;
  else round = Math.floor((currentTime - endBuyDate) / period);

  const date = endBuyDate + round * period;

  return { round, date };
}

// Returns undefined if invalid time
// Else returns round: 0 is use of proceeds and 0 < n <= no.coupons is coupon round
export function getReportRatingRound(
  startBuyDate: number,
  endBuyDate: number,
  maturityDate: number,
  period: number,
): number | undefined {
  const currentTime: number = Date.now() / 1000;

  let round: number | undefined;

  if (currentTime < startBuyDate) {
    // Use of proceeds must be before bond is bought
    round = 0;
  } else if (currentTime >= endBuyDate && currentTime < maturityDate) {
    round = Math.ceil((currentTime - endBuyDate) / period);
  }
  // Undefined if between startBuyDate and endBuyDate
  // Undefined if after maturityDate

  return round;
}

// Returns app state value - 0 if key doesn't exist
export function getStateValue(state: Map<string, any>, key: string) {
  if (state.has(key)) {
    return state.get(key);
  } else {
    return 0;
  }
}

// Returns rating - 0 if key doesn't exist
export function getRatingFromState(round: number, state?: Map<string, any>): number {
  if (!state) return 0;

  const key: string = Math.floor(round / 8) + '';
  const slot = round % 8;
  const array: Uint8Array | number = getStateValue(state, key);
  if (array === 0) {
    // Uninitialised array
    return 0;
  } else {
    return array[slot];
  }
}

export function getMultiplier(rating: number): number {
  const penalty: number = rating === 0 ? 0 : 5 - rating;
  return 1.1 ** penalty;
}

// Returns round and money owed then if defaulted
// Returns undefined if has not defaulted
export function getHasDefaulted(
  app: App,
  couponRound: number,
  globalCouponsPaid: number,
  stablecoinEscrowBalance: number,
  bondEscrowBalance: number,
  bondsMinted: number,
  manageAppState: AppState,
  reserve: number
): Defaulted | undefined {
  // Not defaulted if have already started paying out the curr round
  if (globalCouponsPaid === couponRound) return undefined;

  const currentTime: number = Date.now() / 1000;

  const { maturity_date, bond_coupon, bond_principal } = app;
  const numBondsInCirculation = bondsMinted - bondEscrowBalance;

  let round = globalCouponsPaid + 1;
  let totalOwed: number = reserve;
  for (; round <= couponRound; round++) {
    const rating = getRatingFromState(round, manageAppState);
    const multiplier = getMultiplier(rating);
    totalOwed += Math.floor(bond_coupon * multiplier) * numBondsInCirculation;
    if (totalOwed > stablecoinEscrowBalance) {
      return {
        round,
        owedAtRound: totalOwed,
        isDueToPrincipal: false
      }
    }
  }

  if (currentTime >= maturity_date) {
    totalOwed += bond_principal * numBondsInCirculation;
    if (totalOwed > stablecoinEscrowBalance) {
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