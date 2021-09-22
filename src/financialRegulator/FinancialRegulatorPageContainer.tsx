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
import { NotificationManager } from 'react-notifications';

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
  const [isAllFrozen, setIsAllFrozen] = useState<boolean>(true);

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
    setApps([]); // clear

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FetchAppsFilter.FINANCIAL_REGULATOR, selectedAccount!.address);
    });

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount?.address]);

  // On entering into new app
  useEffect(() => {
    if (!selectedApp) return;
    getAppAccounts(selectedApp.app_id, selectedApp.bond_id).then(accs => setAppAccounts(accs));
    setIsAllFrozen(getStateValue('frozen', selectedApp?.app_global_state) === 0);
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
    const txId = await freeze(selectedApp.app_id, selectedAccount.address, toFreeze, true);

    // Update frozen value
    algodClient.getApplicationByID(selectedApp.app_id).do().then(mainApp => {
      setMainAppGlobalState(selectedApp.app_id, extractAppState(mainApp.params['global-state']));
      const isFrozen = getStateValue('frozen', selectedApp?.app_global_state) === 0;
      setIsAllFrozen(isFrozen);
      NotificationManager.success(
        '',
        `Issuance ${isFrozen ? 'Frozen' : 'Unfrozen'}`,
        5000,
        () => window.open("https://testnet.algoexplorer.io/tx/" + txId, '_blank')
      );
    })
  }

  const freezeAddress = async (toFreeze: boolean, addr: string) => {
    if (!selectedAccount || !selectedApp) return;
    const txId = await freeze(selectedApp.app_id, selectedAccount.address, toFreeze, false, addr);

    // Update frozen value
    getAccountInformation(addr).then(account => {
      const accs: AppAccount[] = [...appAccounts];
      const foundIndex = accs.findIndex(acc => acc.addr === addr);
      const localState: AppState | undefined = account.appsLocalState.get(selectedApp.app_id);
      const isFrozen = getStateValue('frozen', localState) === 0
      accs[foundIndex].frozen = isFrozen;
      setAppAccounts(accs);
      NotificationManager.success(
        '',
        `Account ${isFrozen ? 'Frozen' : 'Unfrozen'}`,
        5000,
        () => window.open("https://testnet.algoexplorer.io/tx/" + txId, '_blank')
      );
    });
  }

  return (
    <FinancialRegulatorPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={selectedApp}
      appAccounts={appAccounts}
      isAllFrozen={isAllFrozen}
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
