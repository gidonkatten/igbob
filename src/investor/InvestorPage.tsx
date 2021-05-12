import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/bond/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { setSelectedAccount } from '../redux/actions/actions';
import { App } from '../redux/reducers/bond';
import {
  getAppSelector,
  getBondBalanceSelector,
  getCouponRoundsCollSelector,
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/selectors';
import { getAccountInformation, getAssetBalance, getStablecoinBalance } from '../algorand/balance/Balance';
import Button from '@material-ui/core/Button';
import { UserAccount } from '../redux/reducers/user';
import { formatStablecoin } from '../utils/Utils';
import { claimCoupon } from '../algorand/bond/Coupon';
import { claimPrincipal } from '../algorand/bond/Principal';
import BondTimeline from '../common/BondTimeline';
import { indexerClient } from '../algorand/utils/Utils';
import { claimDefault } from '../algorand/bond/Default';
import { getHasDefaulted } from './Utils';
import { optIntoApp } from '../algorand/bond/OptIntoApp';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import AppList from '../common/AppList';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number;
  getOptedIntoApp: (appId: number) => boolean;
  getCouponRoundsColl: (appId: number) => number;
  getApp: (appId: number) => App | undefined;}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
}

interface OwnProps {}

type InvestorPageProps = StateProps & DispatchProps & OwnProps;

function InvestorPage(props: InvestorPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(0);

  // Blockchain readings
  const [bondsMinted, setBondsMinted] = useState<number>(0);
  const [bondEscrowBalance, setBondEscrowBalance] = useState<number>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number>(0);
  const [hasDefaulted, setHasDefaulted] = useState<boolean>(false);

  const {
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
    getOptedIntoApp,
    getCouponRoundsColl,
    getApp,
    setSelectedAccount,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app.start_buy_date) && (currentTime < app.end_buy_date);
  const afterCouponRound = (round) => app && (currentTime > (app.end_buy_date + app.period * round));
  const afterMaturity = app && (currentTime > app.maturity_date);

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

  const canClaimCoupon = () => {
    if (!app) return false;

    const couponRoundsColl = getCouponRoundsColl(app.app_id);
    return afterCouponRound(couponRoundsColl + 1) &&
      bondBalance > 0 &&
      couponRoundsColl < app.bond_length &&
      getOptedIntoApp(app.app_id) &&
      !hasDefaulted
  }

  const couponTooltip = () => {
    if (!app) return undefined;

    const couponRoundsColl = getCouponRoundsColl(app.app_id);

    let err = '';
    if (!afterCouponRound(couponRoundsColl + 1) && couponRoundsColl < app.bond_length) err = err.concat('Not after coupon date\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (couponRoundsColl >= app.bond_length) err = err.concat('Have collected all coupons\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    if (hasDefaulted) err = err.concat('Not enough funds to pay out all money owed\n')
    return err;
  }

  const canClaimPrincipal = () => {
    if (!app) return undefined;
    const couponRoundsColl = getCouponRoundsColl(app.app_id);

    return afterMaturity &&
      bondBalance > 0 &&
      couponRoundsColl >= app.bond_length &&
      getOptedIntoApp(app.app_id) &&
      !hasDefaulted
  }

  const principalTooltip = () => {
    if (!app) return undefined;

    const couponRoundsColl = getCouponRoundsColl(app.app_id);

    let err = '';
    if (!afterMaturity) err = err.concat('Not after maturity date\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (couponRoundsColl < app.bond_length) err = err.concat('Have not collected all coupons\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    if (hasDefaulted) err = err.concat('Not enough funds to pay out all money owed\n')
    return err;
  }

  const canClaimDefault = () => {
    if (!app) return undefined;

    return hasDefaulted &&
      bondBalance > 0 &&
      getOptedIntoApp(app.app_id)
  }

  const defaultTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (!hasDefaulted) err = err.concat('Enough funds to pay money owed\n')
    if (bondBalance === 0) err = err.concat('Do not own bond\n')
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Have not opted into app\n')
    return err;
  }

  const bondBalance: number = app ? getBondBalance(app.bond_id) : 0;

  const handleAssetOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoAsset(app.bond_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  const handleAppOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoApp(app.app_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
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

  const handleClaimCoupon = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;
    await claimCoupon(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.bond_id,
      app.bond_escrow_address,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      app.bond_coupon
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    )
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
      (1 / (bondsMinted - bondEscrowBalance)) * stablecoinEscrowBalance
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

  useEffect(() => {
    if (!app) return;

    Promise.all(
      [
        indexerClient.lookupAssetByID(app.bond_id).do(),
        getAccountInformation(app.bond_escrow_address),
        getAccountInformation(app.stablecoin_escrow_address)
      ]
    ).then(([asset, bondEscrow, stablecoinEscrow]) => {

      const bMinted = asset.asset.params.total;
      const bEscrowBalance = getAssetBalance(bondEscrow, app.bond_id);
      const sEscrowBalance = getStablecoinBalance(stablecoinEscrow);

      setBondsMinted(bMinted);
      setBondEscrowBalance(bEscrowBalance);
      setStablecoinEscrowBalance(sEscrowBalance);
      setHasDefaulted(getHasDefaulted(
        app.end_buy_date,
        app.maturity_date,
        app.period,
        app.bond_length,
        getCouponRoundsColl(app.app_id),
        app.bond_coupon,
        app.bond_principal,
        sEscrowBalance,
        bMinted - bEscrowBalance
      ));
    });
  }, [app])

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appsList = (
    <div>
      <h3>Listed Green Bonds</h3>
      <AppList onClick={enterAppView}/>
    </div>
  )

  const appView = app && (
    <div>

      <IconButton onClick={exitAppView}><ArrowBackIcon/></IconButton>

      <BondTimeline
        startBuyDate={app.start_buy_date}
        endBuyDate={app.end_buy_date}
        bondLength={app.bond_length}
        maturityDate={app.maturity_date}
        period={app.period}
      />

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
              You have claimed {getCouponRoundsColl(app.app_id)} / {app.bond_length} coupons <br/>
              Can claim ${formatStablecoin(bondBalance * app.bond_coupon)} <br/>
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
              Can claim ${formatStablecoin((bondBalance / (bondsMinted - bondEscrowBalance)) * stablecoinEscrowBalance)} <br/>
              CLAIM DEFAULT
            </Button>
          </div>
        </Grid>

      </Grid>

      <div>
        <p>Name: {app.name}</p>
        <p>Description: {app.description}</p>
        <p>Start buy date: {app.start_buy_date}</p>
        <p>End buy date: {app.end_buy_date}</p>
        <p>Maturity date: {app.maturity_date}</p>
        <p>Bond cost: ${formatStablecoin(app.bond_cost)}</p>
        <p>Bond coupon: ${formatStablecoin(app.bond_coupon)}</p>
        <p>Number of coupon payments: {app.bond_length}</p>
        <p>Bond principal: ${formatStablecoin(app.bond_principal)}</p>
        <p>Bonds in circulation: {bondsMinted - bondEscrowBalance} / {bondsMinted}</p>
        <p>Stablecoin balance of bond escrow: ${formatStablecoin(stablecoinEscrowBalance)}</p>
        <p>Bond balance: {bondBalance}</p>
      </div>

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
  getCouponRoundsColl: getCouponRoundsCollSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPage);