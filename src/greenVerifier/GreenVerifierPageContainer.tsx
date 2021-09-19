import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { App, UserAccount } from '../redux/types';
import { algodClient } from '../algorand/utils/Utils';
import {
  clearSelectedApp,
  setApps,
  setMainAppGlobalState,
  setSelectedApp
} from '../redux/actions/actions';
import { rate } from '../algorand/bond/Rate';
import { getReportRatingRound } from '../investor/Utils';
import { GreenVerifierPage } from './GreenVerifierPage';
import { useAuth0 } from '@auth0/auth0-react';
import { FetchAppsFilter, fetchApps } from '../common/Utils';
import { selectedAppSelector } from '../redux/selectors/bondSelector';
import { NotificationManager } from 'react-notifications';
import { extractAppState } from '../utils/Utils';

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


type GreenVerifierPageContainerProps = StateProps & DispatchProps & OwnProps;

function GreenVerifierPageContainer(props: GreenVerifierPageContainerProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [rating, setRating] = useState<number | null>(0);

  const {
    selectedAccount,
    selectedApp,
    setMainAppGlobalState,
    setApps,
    clearSelectedApp,
    setSelectedApp,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is green verifier
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FetchAppsFilter.GREEN_VERIFIER, selectedAccount!.address);
    });

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount]);

  const reportRatingRound: number | undefined = selectedApp ?
    getReportRatingRound(selectedApp) :
    undefined;

  // RATE
  const handleRate = async () => {
    if (!selectedAccount || !selectedApp || !rating) return;

    await rate(selectedApp.app_id, selectedAccount.address, rating);

    // Update ratings
    algodClient.getApplicationByID(selectedApp.app_id).do().then(app => {
      setMainAppGlobalState(selectedApp.app_id, extractAppState(app.params['global-state']));
      NotificationManager.success('', 'Rating Added');
    })
  }

  const rateText = (): string => {
    if (reportRatingRound === undefined) return 'Add Rating Not Available At This Time';
    if (reportRatingRound === 0) return 'Add Rating For Use of Proceeds'
    return 'Add Rating For Report ' + reportRatingRound;
  }

  const enterAppView = (appId: number) => {
    setInOverview(false);
    setSelectedApp(appId);
  }

  const exitAppView = () => {
    setInOverview(true);
    clearSelectedApp();
  }

  return (
    <GreenVerifierPage
      inOverview={inOverview}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      app={selectedApp}
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
  selectedApp: selectedAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  setMainAppGlobalState,
  clearSelectedApp,
  setSelectedApp,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GreenVerifierPageContainer);
