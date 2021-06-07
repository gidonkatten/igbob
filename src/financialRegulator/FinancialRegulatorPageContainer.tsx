import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { App, AppAccount, UserAccount } from '../redux/types';
import { setApps } from '../redux/actions/actions';
import { FinancialRegulatorPage } from './FinancialRegulatorPage';
import { FETCH_APPS_FILTER, fetchApps } from '../common/Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { getAppAccounts } from '../algorand/account/Account';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
}

interface OwnProps {}


type FinancialRegulatorPageContainerProps = StateProps & DispatchProps & OwnProps;

function FinancialRegulatorPageContainer(props: FinancialRegulatorPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [appAccounts, setAppAccounts] = useState<AppAccount[]>([]);

  const {
    selectedAccount,
    getApp,
    setApps,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is financial regulator
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FETCH_APPS_FILTER.FINANCIAL_REGULATOR, selectedAccount!.address);
    });

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount]);

  // On entering into new app
  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;
    getAppAccounts(app.app_id, app.bond_id).then(accs => setAppAccounts(accs));
  }, [appId]);


  const enterAppView = (appId: number) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  return (
    <FinancialRegulatorPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={app}
      appAccounts={appAccounts}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FinancialRegulatorPageContainer);
