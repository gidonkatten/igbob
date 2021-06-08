import React, { useState } from 'react';
import { connect } from 'react-redux'
import {
  setApps,
  setSelectedAccount,
  setTrades
} from '../redux/actions/actions';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector, getTradesSelector } from '../redux/selectors/bondSelector';
import { getAccountInformation } from '../algorand/account/Account';
import { App, Trade, UserAccount } from '../redux/types';
import { InvestorPage } from './InvestorPage';
import { useAuth0 } from '@auth0/auth0-react';
import {
  BondStatus,
  FetchAppsFilter,
  FETCH_MY_TRADES_FILTER,
  FETCH_TRADES_FILTER,
  fetchApps,
  fetchTrades, fetchApp
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
}

interface OwnProps {}

type InvestorPageContainerProps = StateProps & DispatchProps & OwnProps;

function InvestorPageContainer(props: InvestorPageContainerProps) {

  const [investorPageNav, setInvestorPageNav] = useState<InvestorPageNav>(InvestorPageNav.SELECTION);
  const [app, setApp] = useState<App>();
  const [trade, setTrade] = useState<Trade>();
  const [bondStatus, setBondStatus] = useState<BondStatus>();

  const {
    selectedAccount,
    getApp,
    getTrade,
    setSelectedAccount,
    setApps,
    setTrades,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  const enterAppsTable = async (filter: FetchAppsFilter, bondStatus: BondStatus) => {
    setInvestorPageNav(InvestorPageNav.APPS_TABLE);
    setBondStatus(bondStatus);
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
    setApp(getApp(appId));
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

  const enterTrade = (tradeId: number, appId: number) => {
    setInvestorPageNav(InvestorPageNav.TRADE);
    console.log('called');
    console.log(tradeId);
    console.log(appId);
    console.log(getTrade(tradeId));
    console.log(getApp(appId));
    setTrade(getTrade(tradeId));
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, appId);
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
    });
  }

  const exitManageTradesTable = () => {
    setInvestorPageNav(InvestorPageNav.SELECTION);
  }

  const enterManageTrade = (tradeId: number, appId: number, addr: string) => {
    if (!selectedAccount) return;

    // Switch of account if necessary
    if (selectedAccount.address !== addr) {
      if (window.confirm(`The selected account will be switched to the one with the trade offer`)) {
        getAccountInformation(addr).then(acc => setSelectedAccount(acc));
      } else {
        return;
      }
    }

    setInvestorPageNav(InvestorPageNav.MANAGE_TRADE);
    setTrade(getTrade(tradeId));
    getAccessTokenSilently().then(accessToken => {
      fetchApp(accessToken, setApp, appId);
    });
  }

  const exitManageTrade = () => {
    setInvestorPageNav(InvestorPageNav.MANAGE_TRADES_TABLE);
    setApp(undefined);
    setTrade(undefined);
  }

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
      bondStatus={bondStatus}
      selectedAccount={selectedAccount}
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
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(InvestorPageContainer);