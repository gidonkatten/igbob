import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { App, AppAccount, AppState, UserAccount } from '../redux/types';
import { clearSelectedApp, setApps, setMainAppGlobalState, setSelectedApp } from '../redux/actions/actions';
import { FinancialRegulatorPage } from './FinancialRegulatorPage';
import { FetchAppsFilter, fetchApps } from '../common/Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { getAccountInformation, getAppAccounts } from '../algorand/account/Account';
import { algodClient } from '../algorand/utils/Utils';
import { extractAppState } from '../utils/Utils';
import { freeze } from '../algorand/bond/Freeze';
import { getStateValue } from '../investor/Utils';
import { selectedAppSelector } from '../redux/selectors/bondSelector';

interface StateProps {
  selectedAccount?: UserAccount;
  selectedApp?: App;
}

interface DispatchProps {
  setApps: typeof setApps;
  setMainAppGlobalState: typeof setMainAppGlobalState;
  clearSelectedApp: typeof clearSelectedApp;
  setSelectedApp: typeof setSelectedApp;
}

interface OwnProps {}


type FinancialRegulatorPageContainerProps = StateProps & DispatchProps & OwnProps;

function FinancialRegulatorPageContainer(props: FinancialRegulatorPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [appAccounts, setAppAccounts] = useState<AppAccount[]>([]);

  const {
    selectedAccount,
    selectedApp,
    setApps,
    setMainAppGlobalState,
    clearSelectedApp,
    setSelectedApp,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is financial regulator
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FetchAppsFilter.FINANCIAL_REGULATOR, selectedAccount!.address);
    });

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount]);

  // On entering into new app
  useEffect(() => {
    if (!selectedApp) return;
    getAppAccounts(selectedApp.app_id, selectedApp.bond_id).then(accs => setAppAccounts(accs));
  }, [selectedApp?.app_id]);


  const enterAppView = (appId: number) => {
    setInOverview(false);
    setSelectedApp(appId);
  }

  const exitAppView = () => {
    setInOverview(true);
    clearSelectedApp();
  }

  // FREEZE
  const freezeAll = async (toFreeze: boolean) => {
    if (!selectedAccount || !selectedApp) return;
    await freeze(selectedApp.app_id, selectedAccount.address, toFreeze, true);

    // Update frozen value
    algodClient.getApplicationByID(selectedApp.app_id).do().then(mainApp => {
      setMainAppGlobalState(selectedApp.app_id, extractAppState(mainApp.params['global-state']));
    })
  }

  const freezeAddress = async (toFreeze: boolean, addr: string) => {
    if (!selectedAccount || !selectedApp) return;
    await freeze(selectedApp.app_id, selectedAccount.address, toFreeze, false, addr);

    // Update frozen value
    getAccountInformation(addr).then(account => {
      const accs: AppAccount[] = [...appAccounts];
      const foundIndex = accs.findIndex(acc => acc.addr === addr);
      const localState: AppState | undefined = account.appsLocalState.get(selectedApp.app_id);
      accs[foundIndex].frozen = getStateValue('Frozen', localState);
      setAppAccounts(accs);
    });
  }

  return (
    <FinancialRegulatorPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={selectedApp}
      appAccounts={appAccounts}
      freezeAll={freezeAll}
      freezeAddress={freezeAddress}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  selectedApp: selectedAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setMainAppGlobalState,
  clearSelectedApp,
  setSelectedApp,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FinancialRegulatorPageContainer);
