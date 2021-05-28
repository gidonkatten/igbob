import React, { useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { getAppSelector } from '../redux/selectors/bondSelector';
import AppList from '../common/AppList';
import { UserAccount } from '../redux/reducers/userReducer';
import Rating from '@material-ui/lab/Rating';
import { App } from '../redux/types';
import { algodClient } from '../algorand/utils/Utils';
import { extractManageAppState } from '../utils/Utils';
import { setManageAppGlobalState } from '../redux/actions/actions';
import { rate } from '../algorand/bond/Rate';
import Button from '@material-ui/core/Button';
import { getReportRatingRound } from '../investor/Utils';
import { BackButton } from '../common/BackButton';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';
import { GreenVerifierPage } from './GreenVerifierPage';

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setManageAppGlobalState: typeof setManageAppGlobalState,
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
    if (reportRatingRound === undefined) return 'Not Available At This Time';
    if (reportRatingRound === 0) return 'For Use of Proceeds'
    return 'For Report ' + reportRatingRound;
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
      selectedAccount={selectedAccount}
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
  setManageAppGlobalState
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GreenVerifierPageContainer);
