import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { extractAppState, formatAlgoDecimalNumber } from '../utils/Utils';
import { getAccountInformation, getAssetBalance, getStablecoinBalance } from '../algorand/account/Account';
import { App, UserAccount } from '../redux/types';
import { connect } from 'react-redux';
import {
  setAppBondEscrowBalance,
  setAppStablecoinEscrowBalance,
  setMainAppGlobalState,
  setSelectedAccount
} from '../redux/actions/actions';
import {
  getAppLocalCouponRoundsPaidSelector,
  getAppLocalFrozenSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { getMultiplier, getRatingFromState, getStateValue } from './Utils';
import { claimCoupon } from '../algorand/bond/Coupon';
import { claimPrincipal } from '../algorand/bond/Principal';
import { claimDefault } from '../algorand/bond/Default';
import { algodClient } from '../algorand/utils/Utils';

interface StateProps {
  selectedAccount?: UserAccount;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalCouponRoundsPaid: (appId: number) => number;
  getAppLocalFrozen: (appId: number) => boolean;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setAppBondEscrowBalance: typeof setAppBondEscrowBalance;
  setAppStablecoinEscrowBalance: typeof setAppStablecoinEscrowBalance;
  setMainAppGlobalState: typeof setMainAppGlobalState;
}

interface OwnProps {
  app: App;
}

type ClaimProps = StateProps & DispatchProps & OwnProps;

function ClaimContainer(props: ClaimProps) {

  const [defaultAmount, setDefaultAmount] = useState<number>(0);

  const {
    app,
    selectedAccount,
    getBondBalance,
    getOptedIntoApp,
    getAppLocalCouponRoundsPaid,
    getAppLocalFrozen,
    setSelectedAccount,
    setAppBondEscrowBalance,
    setAppStablecoinEscrowBalance,
    setMainAppGlobalState,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const afterMaturity = app && (currentTime > app.maturity_date);

  // COUPON
  const canClaimCoupon = () => {
    if (!app || !app.coupon_round) return false;

    const couponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasNotDefaulted = !app.defaulted || (app.defaulted && (couponRoundsPaid + 1 < app.defaulted.round));

    return app.coupon_round.round > couponRoundsPaid &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id) &&
      hasNotDefaulted &&
      getStateValue('Frozen', app.app_global_state) > 0 &&
      !getAppLocalFrozen(app.app_id);
  }

  const couponTooltip = () => {
    if (!app || !app.coupon_round) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasDefaulted = app.defaulted && (localCouponRoundsPaid + 1 === app.defaulted.round);

    let err = '';
    if (localCouponRoundsPaid >= app.coupon_round.round) err = err.concat('Have collected all available coupons\n');
    if (bondBalance === 0) err = err.concat('Do not own bond\n');
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n');
    if (hasDefaulted) err = err.concat('Not enough funds to pay out money owed at this round\n');
    if (getStateValue('Frozen', app.app_global_state) === 0) err = err.concat('All accounts are frozen\n');
    if (getAppLocalFrozen(app.app_id)) err = err.concat('Your account is frozen\n');
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
    algodClient.getApplicationByID(app.app_id).do().then(mainApp => {
      setMainAppGlobalState(app.app_id, extractAppState(mainApp.params['global-state']));
    });
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setAppStablecoinEscrowBalance(app.app_id, getStablecoinBalance(acc) as number)
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
      !app.defaulted &&
      getStateValue('Frozen', app.app_global_state) > 0 &&
      !getAppLocalFrozen(app.app_id);
  }

  const principalTooltip = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (!afterMaturity) err = err.concat('Not after maturity date\n');
    if (bondBalance === 0) err = err.concat('Do not own bond\n');
    if (localCouponRoundsPaid < app.bond_length) err = err.concat('Have not collected all coupons\n');
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n');
    if (app.defaulted) err = err.concat('Not enough funds to pay out all money owed\n');
    if (getStateValue('Frozen', app.app_global_state) === 0) err = err.concat('All accounts are frozen\n');
    if (getAppLocalFrozen(app.app_id)) err = err.concat('Your account is frozen\n');
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
      setAppStablecoinEscrowBalance(app.app_id, getStablecoinBalance(acc) as number)
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setAppBondEscrowBalance(app.app_id, getAssetBalance(acc, app.bond_id) as number)
    );
  }

  // DEFAULT
  const canClaimDefault = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    const hasDefaulted = app.defaulted && (localCouponRoundsPaid + 1 === app.defaulted.round);

    return hasDefaulted &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id) &&
      getStateValue('Frozen', app.app_global_state) > 0 &&
      !getAppLocalFrozen(app.app_id);
  }

  const defaultTooltip = () => {
    if (!app) return undefined;

    const localCouponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (!app.defaulted) err = err.concat('Enough funds to pay money owed\n');
    if (app.defaulted && (localCouponRoundsPaid + 1 < app.defaulted.round)) err = err.concat('Have not collected all available coupons\n');
    if (bondBalance === 0) err = err.concat('Do not own bond\n');
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n');
    if (getStateValue('Frozen', app.app_global_state) === 0) err = err.concat('All accounts are frozen\n');
    if (getAppLocalFrozen(app.app_id)) err = err.concat('Your account is frozen\n');
    return err;
  }

  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  useEffect(() => {
    if (
      !app ||
      !app.bonds_minted ||
      !app.bond_escrow_balance ||
      !app.stablecoin_escrow_balance
    ) {
      setDefaultAmount(0);
      return;
    }

    const bondsCirc = app.bonds_minted - app.bond_escrow_balance;
    const funds = app.stablecoin_escrow_balance - getStateValue( "Reserve", app.app_global_state);
    setDefaultAmount((funds * bondBalance) / bondsCirc);
  }, [app, app.bonds_minted, app.bond_escrow_balance, app.stablecoin_escrow_balance]);

  const handleClaimDefault = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount ||
      !app ||
      app.bonds_minted === undefined ||
      app.bond_escrow_balance === undefined ||
      app.stablecoin_escrow_balance === undefined
    ) return;

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
      defaultAmount,
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setAppStablecoinEscrowBalance(app.app_id, getStablecoinBalance(acc) as number)
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setAppBondEscrowBalance(app.app_id, getAssetBalance(acc, app.bond_id) as number)
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
            Can claim ${formatAlgoDecimalNumber(Math.floor(app.bond_coupon * getMultiplier(getRatingFromState(getAppLocalCouponRoundsPaid(app.app_id) + 1, app.manage_app_global_state))) * bondBalance)} <br/>
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
            Can claim ${formatAlgoDecimalNumber(bondBalance * app.bond_principal)} <br/>
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
            Stablecoin balance of bond escrow: ${formatAlgoDecimalNumber(app.stablecoin_escrow_balance === undefined ? 0 : app.stablecoin_escrow_balance)} <br/>
            {app.defaulted ?
              app.defaulted.isDueToPrincipal ?
                ('Defaulted at principal payment owing $' + formatAlgoDecimalNumber(app.defaulted.owedAtRound) + '. ') :
                ('Defaulted at coupon payment ' + app.defaulted.round + ' owing $' + formatAlgoDecimalNumber(app.defaulted.owedAtRound) + ". ") :
              undefined
            }
            Can claim ${formatAlgoDecimalNumber(defaultAmount)} <br/>
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
  getAppLocalFrozen: getAppLocalFrozenSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setAppBondEscrowBalance,
  setAppStablecoinEscrowBalance,
  setMainAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(ClaimContainer);
