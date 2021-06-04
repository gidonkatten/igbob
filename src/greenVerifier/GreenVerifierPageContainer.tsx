import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { UserAccount } from '../redux/reducers/userReducer';
import { App } from '../redux/types';
import { algodClient } from '../algorand/utils/Utils';
import { extractManageAppState } from '../utils/Utils';
import { setApps, setManageAppGlobalState } from '../redux/actions/actions';
import { rate } from '../algorand/bond/Rate';
import { getReportRatingRound } from '../investor/Utils';
import { GreenVerifierPage } from './GreenVerifierPage';
import { useAuth0 } from '@auth0/auth0-react';
import { FETCH_APPS_FILTER, fetchApps } from '../common/Utils';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
  setManageAppGlobalState: typeof setManageAppGlobalState;
}

interface OwnProps {}


type GreenVerifierPageContainerProps = StateProps & DispatchProps & OwnProps;

function GreenVerifierPageContainer(props: GreenVerifierPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [rating, setRating] = useState<number | null>(0);

  const {
    selectedAccount,
    getApp,
    setManageAppGlobalState,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is green verifier
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FETCH_APPS_FILTER.GREEN_VERIFIER, selectedAccount!.address);
    })
  }, [selectedAccount]);

  const reportRatingRound: number | undefined = app ? getReportRatingRound(
    app.start_buy_date,
    app.end_buy_date,
    app.maturity_date,
    app.period
  ) : undefined;

  // RATE
  const handleRate = async () => {
    if (!selectedAccount || !app || !rating) return;
    await rate(app.manage_app_id, selectedAccount.address, rating);

    algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
      setManageAppGlobalState(app.app_id, extractManageAppState(manageApp.params['global-state']));
    })
  }

  const rateText = (): string => {
    if (reportRatingRound === undefined) return 'Add Rating Not Available At This Time';
    if (reportRatingRound === 0) return 'Add Rating For Use of Proceeds'
    return 'Add Rating For Report ' + reportRatingRound;
  }

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
    <GreenVerifierPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={app}
      rating={rating}
      setRating={setRating}
      reportRatingRound={reportRatingRound}
      handleRate={handleRate}
      rateText={rateText()}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setManageAppGlobalState,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GreenVerifierPageContainer);
