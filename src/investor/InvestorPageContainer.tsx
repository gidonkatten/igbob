import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { setMainAppGlobalState, setManageAppGlobalState } from '../redux/actions/actions';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import {
  getAccountInformation,
  getAssetBalance,
  getStablecoinBalance
} from '../algorand/account/Account';
import { UserAccount } from '../redux/reducers/userReducer';
import { extractAppState, extractManageAppState } from '../utils/Utils';
import { algodClient, indexerClient } from '../algorand/utils/Utils';
import {
  CouponRound,
  Defaulted,
  getCouponRound,
  getHasDefaulted,
  getStateValue
} from './Utils';
import { App, AppState } from '../redux/types';
import { InvestorPage } from './InvestorPage';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setMainAppGlobalState: typeof setMainAppGlobalState,
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}

type InvestorPageContainerProps = StateProps & DispatchProps & OwnProps;

function InvestorPageContainer(props: InvestorPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();

  // Blockchain readings
  const [bondsMinted, setBondsMinted] = useState<number>(0);
  const [bondEscrowBalance, setBondEscrowBalance] = useState<number | bigint>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number | bigint>(0);
  const [defaulted, setDefaulted] = useState<Defaulted | undefined>(undefined);
  const [couponRound, setCouponRound] = useState<CouponRound | undefined>(undefined);

  const {
    selectedAccount,
    getApp,
    setMainAppGlobalState,
    setManageAppGlobalState,
  } = props;

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

      const globalCouponRoundsPaid: number = getStateValue("CouponsPaid", mainAppGlobalState);
      const reserve: number = getStateValue( "Reserve", mainAppGlobalState);

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

  return (
    <InvestorPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={app}
      selectedAccount={selectedAccount}
      couponRound={couponRound}
      defaulted={defaulted}
      bondsMinted={bondsMinted}
      bondEscrowBalance={bondEscrowBalance}
      setBondEscrowBalance={setBondEscrowBalance}
      stablecoinEscrowBalance={stablecoinEscrowBalance}
      setStablecoinEscrowBalance={setStablecoinEscrowBalance}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setMainAppGlobalState,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPageContainer);