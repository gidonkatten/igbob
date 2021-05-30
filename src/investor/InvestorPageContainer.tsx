import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { setApps, setMainAppGlobalState, setManageAppGlobalState, setTrades } from '../redux/actions/actions';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector, getTradesSelector } from '../redux/selectors/bondSelector';
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
import { App, AppState, Trade } from '../redux/types';
import { InvestorPage } from './InvestorPage';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FETCH_APPS_FILTER,
  FETCH_MY_TRADES_FILTER,
  FETCH_TRADES_FILTER,
  fetchApp,
  fetchApps,
  fetchTrades
} from '../common/Utils';

export enum InvestorPageNav {
  SELECTION,
  APPS_TABLE,
  INVEST,
  TRADES_TABLE,
  TRADE,
  MANAGE_TRADES_TABLE,
  MANAGE_TRADE,
}

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
  getTrade: (tradeId: number) => Trade | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
  setTrades: typeof setTrades;
  setMainAppGlobalState: typeof setMainAppGlobalState;
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}

type InvestorPageContainerProps = StateProps & DispatchProps & OwnProps;

function InvestorPageContainer(props: InvestorPageContainerProps) {

  const [investorPageNav, setInvestorPageNav] = useState<InvestorPageNav>(InvestorPageNav.SELECTION);
  const [app, setApp] = useState<App>();
  const [trade, setTrade] = useState<Trade>();

  // Blockchain readings
  const [bondsMinted, setBondsMinted] = useState<number>(0);
  const [bondEscrowBalance, setBondEscrowBalance] = useState<number | bigint>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number | bigint>(0);
  const [defaulted, setDefaulted] = useState<Defaulted | undefined>(undefined);
  const [couponRound, setCouponRound] = useState<CouponRound | undefined>(undefined);

  const {
    selectedAccount,
    getApp,
    getTrade,
    setApps,
    setTrades,
    setMainAppGlobalState,
    setManageAppGlobalState,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  const enterAppsTable = async (filter: FETCH_APPS_FILTER) => {
    setInvestorPageNav(InvestorPageNav.APPS_TABLE);

    // Set apps using given filter e.g. upcoming, live etc
    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, filter);
    })
  }

  const exitAppsTable = () => {
    setInvestorPageNav(InvestorPageNav.SELECTION);
  }

  const enterInvestView = (appId: number) => {
    setInvestorPageNav(InvestorPageNav.INVEST);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitInvestView = () => {
    setInvestorPageNav(InvestorPageNav.APPS_TABLE);
    setApp(undefined);
  }

  const enterTradesTable = async (filter: FETCH_TRADES_FILTER) => {
    setInvestorPageNav(InvestorPageNav.TRADES_TABLE);

    // Set apps using given filter e.g. upcoming, live etc
    getAccessTokenSilently().then(accessToken => {
      fetchTrades(accessToken, setTrades, filter);
    })
  }

  const exitTradesTable = () => {
    setInvestorPageNav(InvestorPageNav.SELECTION);
  }

  const enterTrade = (tradeId: number, app_id: number) => {
    setInvestorPageNav(InvestorPageNav.TRADE);
    const newTrade = getTrade(tradeId);
    setTrade(newTrade);
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, app_id); // This fetches and sets app
    });
  }

  const exitTrade = () => {
    setInvestorPageNav(InvestorPageNav.TRADES_TABLE);
    setApp(undefined);
    setTrade(undefined);
  }

  const enterManageTradesTable = async (filter: FETCH_MY_TRADES_FILTER) => {
    setInvestorPageNav(InvestorPageNav.MANAGE_TRADES_TABLE);

    // Set apps using given filter e.g. upcoming, live etc
    getAccessTokenSilently().then(accessToken => {
      fetchTrades(accessToken, setTrades, filter);
    })
  }

  const exitManageTradesTable = () => {
    setInvestorPageNav(InvestorPageNav.SELECTION);
  }

  const enterManageTrade = (tradeId: number, app_id: number) => {
    setInvestorPageNav(InvestorPageNav.MANAGE_TRADE);
    const newTrade = getTrade(tradeId);
    setTrade(newTrade);
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, app_id); // This fetches and sets app
    });
  }

  const exitManageTrade = () => {
    setInvestorPageNav(InvestorPageNav.MANAGE_TRADES_TABLE);
    setApp(undefined);
    setTrade(undefined);
  }

  // On entering into new app
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
      investorPageNav={investorPageNav}
      enterAppsTable={enterAppsTable}
      exitAppsTable={exitAppsTable}
      enterInvestView={enterInvestView}
      exitInvestView={exitInvestView}
      enterTradesTable={enterTradesTable}
      exitTradesTable={exitTradesTable}
      enterTrade={enterTrade}
      exitTrade={exitTrade}
      enterManageTradesTable={enterManageTradesTable}
      exitManageTradesTable={exitManageTradesTable}
      enterManageTrade={enterManageTrade}
      exitManageTrade={exitManageTrade}
      app={app}
      trade={trade}
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
  getTrade: getTradesSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setTrades,
  setMainAppGlobalState,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPageContainer);