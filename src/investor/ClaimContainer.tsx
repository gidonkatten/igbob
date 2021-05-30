import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { formatStablecoin } from '../utils/Utils';
import { getAccountInformation, getAssetBalance, getStablecoinBalance } from '../algorand/account/Account';
import { App } from '../redux/types';
import { UserAccount } from '../redux/reducers/userReducer';
import { connect } from 'react-redux';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  getAppLocalCouponRoundsPaidSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { CouponRound, Defaulted, getMultiplier, getRatingFromState, getStateValue } from './Utils';
import { claimCoupon } from '../algorand/bond/Coupon';
import { claimPrincipal } from '../algorand/bond/Principal';
import { claimDefault } from '../algorand/bond/Default';

interface StateProps {
  selectedAccount?: UserAccount;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalCouponRoundsPaid: (appId: number) => number;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
}

interface OwnProps {
  app: App;
  couponRound?: CouponRound;
  defaulted?: Defaulted;
  bondsMinted: number;
  bondEscrowBalance: number | bigint;
  setBondEscrowBalance: (balance: number | bigint) => void;
  stablecoinEscrowBalance: number | bigint;
  setStablecoinEscrowBalance: (balance: number | bigint) => void;
}

type ClaimProps = StateProps & DispatchProps & OwnProps;

function ClaimContainer(props: ClaimProps) {

  const {
    app,
    couponRound,
    defaulted,
    bondsMinted,
    bondEscrowBalance,
    setBondEscrowBalance,
    stablecoinEscrowBalance,
    setStablecoinEscrowBalance,
    setSelectedAccount,
    getBondBalance,
    getOptedIntoApp,
    getAppLocalCouponRoundsPaid,
    selectedAccount,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const afterMaturity = app && (currentTime > app.maturity_date);

  // COUPON
  const canClaimCoupon = () => {
    if (!app || !couponRound) return false;

    const couponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasNotDefaulted = !defaulted || (defaulted && (couponRoundsPaid + 1 < defaulted.round));

    return couponRound.round > couponRoundsPaid &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id) &&
      hasNotDefaulted
  }

  const couponTooltip = () => {
    if (!app || !couponRound) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasDefaulted = defaulted && (localCouponRoundsPaid + 1 === defaulted.round);

    let err = '';
    if (localCouponRoundsPaid >= couponRound.round) err = err.concat('Have collected all available coupons\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    if (hasDefaulted) err = err.concat('Not enough funds to pay out money owed at this round\n')
    return err;
  }

  const handleClaimCoupon = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;

    const newLocalCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id) + 1;
    const rating = getRatingFromState(newLocalCouponRoundsPaid, app.manage_app_global_state);

    await claimCoupon(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.bond_id,
      app.bond_escrow_address,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      app.bond_coupon,
      rating
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    )
  }

  // PRINCIPAL
  const canClaimPrincipal = () => {
    if (!app) return undefined;
    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    return afterMaturity &&
      bondBalance > 0 &&
      localCouponRoundsPaid >= app.bond_length &&
      getOptedIntoApp(app.app_id) &&
      !defaulted
  }

  const principalTooltip = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (!afterMaturity) err = err.concat('Not after maturity date\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (localCouponRoundsPaid < app.bond_length) err = err.concat('Have not collected all coupons\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    if (defaulted) err = err.concat('Not enough funds to pay out all money owed\n')
    return err;
  }

  const handleClaimPrincipal = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;
    await claimPrincipal(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      app.bond_principal
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  // DEFAULT
  const canClaimDefault = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasDefaulted = defaulted && (localCouponRoundsPaid + 1 === defaulted.round);

    return hasDefaulted &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id)
  }

  const defaultTooltip = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (!defaulted) err = err.concat('Enough funds to pay money owed\n')
    if (defaulted && (localCouponRoundsPaid + 1 < defaulted.round)) err = err.concat('Have not collected all available coupons\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    return err;
  }

  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  const handleClaimDefault = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;

    const reserve: number = getStateValue( "Reserve", app.app_global_state);

    await claimDefault(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      (1 / (bondsMinted - (bondEscrowBalance as number))) * ((stablecoinEscrowBalance as number) - reserve)
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <div title={couponTooltip()}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            disabled={!canClaimCoupon()}
            onClick={handleClaimCoupon}
          >
            You have claimed {getAppLocalCouponRoundsPaid(app.app_id)} / {app.bond_length} coupons <br/>
            Multiplier for this coupon round is {getMultiplier(getRatingFromState(getAppLocalCouponRoundsPaid(app.app_id) + 1, app.manage_app_global_state)).toFixed(4)} <br/>
            Can claim ${formatStablecoin(Math.floor(app.bond_coupon * getMultiplier(getRatingFromState(getAppLocalCouponRoundsPaid(app.app_id) + 1, app.manage_app_global_state))) * bondBalance)} <br/>
            CLAIM COUPON
          </Button>
        </div>
      </Grid>

      <Grid item xs={4}>
        <div title={principalTooltip()}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            disabled={!canClaimPrincipal()}
            onClick={handleClaimPrincipal}
          >
            Can claim ${formatStablecoin(bondBalance * app.bond_principal)} <br/>
            CLAIM PRINCIPAL
          </Button>
        </div>
      </Grid>

      <Grid item xs={4}>
        <div title={defaultTooltip()}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            disabled={!canClaimDefault()}
            onClick={handleClaimDefault}
          >
            Stablecoin balance of bond escrow: ${formatStablecoin(stablecoinEscrowBalance)} <br/>
            {defaulted ?
              defaulted.isDueToPrincipal ?
                ('Defaulted at principal payment owing $' + formatStablecoin(defaulted.owedAtRound) + '. ') :
                ('Defaulted at coupon payment ' + defaulted.round + ' owing $' + formatStablecoin(defaulted.owedAtRound) + ". ") :
              undefined
            }
            Can claim ${formatStablecoin((bondBalance / (bondsMinted - (bondEscrowBalance as number))) * (stablecoinEscrowBalance as number))} <br/>
            CLAIM DEFAULT
          </Button>
        </div>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalCouponRoundsPaid: getAppLocalCouponRoundsPaidSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ClaimContainer);
