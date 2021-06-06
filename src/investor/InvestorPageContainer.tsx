import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import {
  setApps,
  setMainAppGlobalState,
  setManageAppGlobalState,
  setSelectedAccount,
  setTrades
} from '../redux/actions/actions';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector, getTradesSelector } from '../redux/selectors/bondSelector';
import {
  getAccountInformation,
  getAssetBalance,
  getStablecoinBalance
} from '../algorand/account/Account';
import { indexerClient } from '../algorand/utils/Utils';
import {
  CouponRound,
  Defaulted,
  getCouponRound,
  getHasDefaulted,
} from './Utils';
import { App, Trade, UserAccount } from '../redux/types';
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
  setSelectedAccount: typeof setSelectedAccount;
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
    setSelectedAccount,
    setApps,
    setTrades,
    setMainAppGlobalState,
    setManageAppGlobalState,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  const enterAppsTable = async (filter: FETCH_APPS_FILTER) => {
    setInvestorPageNav(InvestorPageNav.APPS_TABLE);
    setApps([]); // clear

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
    setTrades([]); // clear

    // Set trades using given filter e.g. expired, live etc
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

    // Fetch and set app
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, app_id);
    });
  }

  const exitTrade = () => {
    setInvestorPageNav(InvestorPageNav.TRADES_TABLE);
    setApp(undefined);
    setTrade(undefined);
  }

  const enterManageTradesTable = async (filter: FETCH_MY_TRADES_FILTER) => {
    setInvestorPageNav(InvestorPageNav.MANAGE_TRADES_TABLE);
    setTrades([]); // clear

    // Set trades using given filter e.g. expired, live etc
    getAccessTokenSilently().then(accessToken => {
      fetchTrades(accessToken, setTrades, filter);
    })
  }

  const exitManageTradesTable = () => {
    setInvestorPageNav(InvestorPageNav.SELECTION);
  }

  const enterManageTrade = (tradeId: number, app_id: number, addr: string) => {
    // Switch of account if necessary
    if (selectedAccount &&
      selectedAccount.address !== addr &&
      window.confirm(`The selected account will be switched to the one with the trade offer`)
    ) {
      getAccountInformation(addr).then(acc => setSelectedAccount(acc));
    }

    setInvestorPageNav(InvestorPageNav.MANAGE_TRADE);
    const newTrade = getTrade(tradeId);
    setTrade(newTrade);

    // Fetch and set app
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, app_id);
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

    // TODO: MOVE TO FETCH APPS
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
      setDefaulted(getHasDefaulted(
        app,
        round.round,
        sEscrowBalance as number,
        bEscrowBalance as number,
        bMinted,
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
  setSelectedAccount,
  setApps,
  setTrades,
  setMainAppGlobalState,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPageContainer);