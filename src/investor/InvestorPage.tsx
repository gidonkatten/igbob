import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/bond/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { setMainAppGlobalState, setManageAppGlobalState, setSelectedAccount } from '../redux/actions/actions';
import {
  getAppLocalCouponRoundsPaidSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector,
} from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import {
  getAccountInformation,
  getAssetBalance,
  getStablecoinBalance
} from '../algorand/account/Account';
import Button from '@material-ui/core/Button';
import { UserAccount } from '../redux/reducers/userReducer';
import { extractAppState, extractManageAppState, formatStablecoin } from '../utils/Utils';
import { claimCoupon } from '../algorand/bond/Coupon';
import { claimPrincipal } from '../algorand/bond/Principal';
import BondTimeline from '../common/BondTimeline';
import { algodClient, indexerClient } from '../algorand/utils/Utils';
import { claimDefault } from '../algorand/bond/Default';
import {
  CouponRound,
  Defaulted,
  getCouponRound,
  getHasDefaulted,
  getMultiplier,
  getRatingFromState,
  getStateValue
} from './Utils';
import { optIntoApp } from '../algorand/bond/OptIntoApp';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import AppList from '../common/AppList';
import { App, AppState } from '../redux/types';
import { BackButton } from '../common/BackButton';
import Typography from '@material-ui/core/Typography';
import IPFSFileListContainer from '../common/IPFSFileListContainer';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalCouponRoundsPaid: (appId: number) => number;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setMainAppGlobalState: typeof setMainAppGlobalState,
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}

type InvestorPageProps = StateProps & DispatchProps & OwnProps;

function InvestorPage(props: InvestorPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(1);

  // Blockchain readings
  const [bondsMinted, setBondsMinted] = useState<number>(0);
  const [bondEscrowBalance, setBondEscrowBalance] = useState<number | bigint>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number | bigint>(0);
  const [defaulted, setDefaulted] = useState<Defaulted | undefined>(undefined);
  const [couponRound, setCouponRound] = useState<CouponRound | undefined>(undefined);

  const {
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
    getOptedIntoApp,
    getAppLocalCouponRoundsPaid,
    getApp,
    setSelectedAccount,
    setMainAppGlobalState,
    setManageAppGlobalState,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app.start_buy_date) && (currentTime < app.end_buy_date);
  const afterMaturity = app && (currentTime > app.maturity_date);

  // BOND OPT IN
  const handleAssetOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoAsset(app.bond_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  // APP OPT IN
  const handleAppOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoApp(app.app_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  // BUY
  const canBuy = () => {
    if (!app) return false;

    return inBuyWindow && getOptedIntoBond(app.bond_id);
  }

  const buyTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (!inBuyWindow) err = err.concat('Not in buy window\n')
    if (!getOptedIntoBond(app.bond_id)) err = err.concat('Have not opted into bond\n')
    return err;
  }

  const handleBuy = async () => {
    if (!selectedAccount || !app) return;
    await buyBond(
      selectedAccount.address,
      app.app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy,
      app.bond_cost
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  // COUPON
  const canClaimCoupon = () => {
    if (!app || !couponRound) return false;

    const couponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);
    return couponRound.round > couponRoundsPaid &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id) &&
      !defaulted
  }

  const couponTooltip = () => {
    if (!app || !couponRound) return undefined;

    const couponRoundsPaid = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (couponRoundsPaid >= couponRound.round) err = err.concat('Have collected all available coupons\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    if (defaulted) err = err.concat('Not enough funds to pay out all money owed\n')
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
    const couponRoundsColl = getAppLocalCouponRoundsPaid(app.app_id);

    return afterMaturity &&
      bondBalance > 0 &&
      couponRoundsColl >= app.bond_length &&
      getOptedIntoApp(app.app_id) &&
      !defaulted
  }

  const principalTooltip = () => {
    if (!app) return undefined;

    const couponRoundsColl = getAppLocalCouponRoundsPaid(app.app_id);

    let err = '';
    if (!afterMaturity) err = err.concat('Not after maturity date\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (couponRoundsColl < app.bond_length) err = err.concat('Have not collected all coupons\n')
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

    return !defaulted &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id)
  }

  const defaultTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (defaulted) err = err.concat('Enough funds to pay money owed\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    return err;
  }

  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  const handleClaimDefault = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;

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
      (1 / (bondsMinted - (bondEscrowBalance as number))) * (stablecoinEscrowBalance as number)
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;

    const round = getCouponRound(
      app.end_buy_date,
      app.maturity_date,
      app.period,
      app.bond_length
    );
    setCouponRound(round);

    Promise.all(
      [
        algodClient.getApplicationByID(app.app_id).do(),
        algodClient.getApplicationByID(app.manage_app_id).do(),
        indexerClient.lookupAssetByID(app.bond_id).do(),
        getAccountInformation(app.bond_escrow_address),
        getAccountInformation(app.stablecoin_escrow_address)
      ]
    ).then(([mainApp, manageApp, asset, bondEscrow, stablecoinEscrow]) => {

      const mainAppGlobalState: AppState = extractAppState(mainApp.params['global-state']);
      const manageAppGlobalState: AppState = extractManageAppState(manageApp.params['global-state']);
      const bMinted = asset.asset.params.total;
      const bEscrowBalance = getAssetBalance(bondEscrow, app.bond_id);
      const sEscrowBalance = getStablecoinBalance(stablecoinEscrow);

      const globalCouponRoundsPaid: number = getStateValue(mainAppGlobalState, "CouponsPaid");
      const reserve: number = getStateValue(mainAppGlobalState, "Reserve");

      setMainAppGlobalState(app.app_id, mainAppGlobalState);
      setManageAppGlobalState(app.app_id, manageAppGlobalState);
      setBondsMinted(bMinted);
      setBondEscrowBalance(bEscrowBalance);
      setStablecoinEscrowBalance(sEscrowBalance);
      setDefaulted(getHasDefaulted(
        app,
        round.round,
        globalCouponRoundsPaid,
        sEscrowBalance as number,
        bEscrowBalance as number,
        bMinted,
        manageAppGlobalState,
        reserve,
      ));
    });
  }, [appId])

  const appsList = (
    <div>
      <Typography variant="h3">Listed Green Bonds</Typography>
      <AppList onClick={enterAppView}/>
    </div>
  )

  const appView = app && (
    <div>

      <BackButton onClick={exitAppView}/>

      <Typography variant="h3" gutterBottom>{app.name}</Typography>

      <Typography variant="body1" gutterBottom>{app.description}</Typography>

      <Typography variant="h4" gutterBottom>Bond Timeline</Typography>

      <BondTimeline
        startBuyDate={app.start_buy_date}
        endBuyDate={app.end_buy_date}
        bondLength={app.bond_length}
        maturityDate={app.maturity_date}
        period={app.period}
      />

      <Typography variant="h4" gutterBottom>Bond Rating</Typography>

      <IPFSFileListContainer app={app}/>

      <Typography variant="h4" gutterBottom>Buy / Claim Money</Typography>

      <TextField
        label="Selected Address:"
        defaultValue={selectedAccount ? selectedAccount.address : undefined}
        required
        fullWidth
        InputProps={{ readOnly: true }}
        helperText="Can be changed in settings"
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      <Grid container spacing={3} style={{ marginTop: '8px' }}>

        {/*First Row*/}
        <Grid item xs={6}>
          <div title={getOptedIntoBond(app.bond_id) ? 'Already opted into bond' : undefined}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              disabled={getOptedIntoBond(app.bond_id)}
              onClick={handleAssetOptIn}
            >
              Opt into bond
            </Button>
          </div>
        </Grid>

        <Grid item xs={6}>
          <div title={getOptedIntoApp(app.bond_id) ? 'Already opted into application' : undefined}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              disabled={getOptedIntoApp(app.app_id)}
              onClick={handleAppOptIn}
            >
              Opt into application
            </Button>
          </div>
        </Grid>

        {/*Second Row*/}
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel>No. of Bonds To Buy:</InputLabel>
            <Input
              value={noOfBondsToBuy}
              onChange={e => setNoOfBondsToBuy(parseInt(e.target.value))}
              type="number"
              name="noOfBondsToBuy"
              fullWidth
              required
              inputProps={{ min: 1 }}
              disabled={!canBuy()}
              title={buyTooltip()}
            />
          </FormControl>
        </Grid>

        <Grid item xs={7}>
          <div title={buyTooltip()}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              style={{ textTransform: 'none' }}
              disabled={!canBuy()}
              onClick={handleBuy}
            >
              You own {bondBalance} bonds <br/>
              BUY {noOfBondsToBuy} bonds for ${formatStablecoin(noOfBondsToBuy * app.bond_cost)}
            </Button>
          </div>
        </Grid>

        {/*Third row*/}
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
              Multiplier based on most recent green rating is {getMultiplier(getAppLocalCouponRoundsPaid(app.app_id) + 1).toFixed(4)} <br/>
              Can claim ${formatStablecoin(Math.floor(app.bond_coupon * getMultiplier(getAppLocalCouponRoundsPaid(app.app_id) + 1)) * bondBalance)} <br/>
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

      {/*<div>*/}
      {/*  <p>Bond cost: ${formatStablecoin(app.bond_cost)}</p>*/}
      {/*  <p>Bond coupon: ${formatStablecoin(app.bond_coupon)}</p>*/}
      {/*  <p>Number of coupon payments: {app.bond_length}</p>*/}
      {/*  <p>Bond principal: ${formatStablecoin(app.bond_principal)}</p>*/}
      {/*  <p>Bonds in circulation: {bondsMinted - (bondEscrowBalance as number)} / {bondsMinted}</p>*/}
      {/*  <p>Stablecoin balance of bond escrow: ${formatStablecoin(stablecoinEscrowBalance)}</p>*/}
      {/*  <p>Bond balance: {bondBalance}</p>*/}
      {/*  <p>Stablecoin Escrow Address: {app.stablecoin_escrow_address}</p>*/}
      {/*  <p>Green Verifier Address: {app.green_verifier_address}</p>*/}
      {/*</div>*/}

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalCouponRoundsPaid: getAppLocalCouponRoundsPaidSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setMainAppGlobalState,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPage);