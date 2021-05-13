export interface CouponRound {
  round: number,
  date: number
}

// Returns 0 if none, and bondLength if finished
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

export function getHasDefaulted(
  endBuyDate: number,
  maturityDate: number,
  period: number,
  bondLength: number,
  totalCouponsPaid: number,
  bondCoupon: number,
  bondPrincipal: number,
  stablecoinEscrowBalance: number,
  bondsCirc: number
): boolean {
  console.log(totalCouponsPaid);
  const couponRound = getCouponRound(endBuyDate, maturityDate, period, bondLength).round;
  const couponOwed = (couponRound * bondsCirc - totalCouponsPaid) * bondCoupon;
  const principalOwed = couponRound >= bondLength ? bondsCirc * bondPrincipal : 0;
  const totalOwed = couponOwed + principalOwed;
  return totalOwed > stablecoinEscrowBalance;
}