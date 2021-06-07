import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { App, AppAccount, AppState, UserAccount } from '../redux/types';
import { setApps, setMainAppGlobalState } from '../redux/actions/actions';
import { FinancialRegulatorPage } from './FinancialRegulatorPage';
import { FETCH_APPS_FILTER, fetchApps } from '../common/Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { getAccountInformation, getAppAccounts } from '../algorand/account/Account';
import { algodClient } from '../algorand/utils/Utils';
import { extractAppState } from '../utils/Utils';
import { freeze } from '../algorand/bond/Freeze';
import { getStateValue } from '../investor/Utils';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
  setMainAppGlobalState: typeof setMainAppGlobalState;
}

interface OwnProps {}


type FinancialRegulatorPageContainerProps = StateProps & DispatchProps & OwnProps;

function FinancialRegulatorPageContainer(props: FinancialRegulatorPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [appId, setAppId] = useState<number>();
  const [appAccounts, setAppAccounts] = useState<AppAccount[]>([]);

  const {
    selectedAccount,
    getApp,
    setApps,
    setMainAppGlobalState,
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
  useEffect(() => {
    if (!appId) return;
    const app: App = getApp(appId)!;
    getAppAccounts(app.app_id, app.bond_id).then(accs => setAppAccounts(accs));
  }, [appId]);


  const enterAppView = (appId: number) => {
    setInOverview(false);
    setAppId(appId);
  }

  const exitAppView = () => {
    setInOverview(true);
    setAppId(undefined);
  }

  // FREEZE
  const freezeAll = async (toFreeze: boolean) => {
    if (!selectedAccount || !appId) return;
    const app: App = getApp(appId)!;
    await freeze(app.app_id, selectedAccount.address, toFreeze, true);

    // Update frozen value
    algodClient.getApplicationByID(app.app_id).do().then(mainApp => {
      setMainAppGlobalState(app.app_id, extractAppState(mainApp.params['global-state']));
    })
  }

  const freezeAddress = async (toFreeze: boolean, addr: string) => {
    if (!selectedAccount || !appId) return;
    const app: App = getApp(appId)!;
    await freeze(app.app_id, selectedAccount.address, toFreeze, false, addr);

    // Update frozen value
    getAccountInformation(addr).then(account => {
      const accs: AppAccount[] = [...appAccounts];
      const foundIndex = accs.findIndex(acc => acc.addr == addr);
      const localState: AppState | undefined = account.appsLocalState.get(app.app_id);
      accs[foundIndex].frozen = getStateValue('Frozen', localState);
      setAppAccounts(accs);
    });
  }

  return (
    <FinancialRegulatorPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={appId === undefined ? undefined : getApp(appId)}
      appAccounts={appAccounts}
      freezeAll={freezeAll}
      freezeAddress={freezeAddress}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setMainAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FinancialRegulatorPageContainer);
