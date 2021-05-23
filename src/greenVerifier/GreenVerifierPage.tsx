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

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setManageAppGlobalState: typeof setManageAppGlobalState,
}

interface OwnProps {}


type GreenVerifierPageProps = StateProps & DispatchProps & OwnProps;

function GreenVerifierPage(props: GreenVerifierPageProps) {

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
    if (!selectedAccount || !app || !rating || reportRatingRound === undefined) return;
    await rate(app.manage_app_id, selectedAccount.address, reportRatingRound, rating);

    algodClient.getApplicationByID(app.manage_app_id).do().then(manageApp => {
      setManageAppGlobalState(app.app_id, extractManageAppState(manageApp.params['global-state']));
    })
  }

  const rateText = (): string => {
    if (reportRatingRound === undefined) return 'Not Available At This Time';
    if (reportRatingRound === 0) return 'For Use of Proceeds'
    return 'For Report ' + reportRatingRound;
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appsList = (
    <div>
      <Typography variant="h3">Green Verifier For These Green Bonds</Typography>
      <AppList
        onClick={enterAppView}
        appFilter={(app: App) => app.green_verifier_address === (selectedAccount ? selectedAccount.address : undefined)}
      />
    </div>
  )

  const appView = app && (
    <div>

      <BackButton onClick={exitAppView}/>

      <Rating
        name="simple-controlled"
        size="large"
        value={rating}
        onChange={(e, newValue) => setRating(newValue)}
        style={{ float: 'left', paddingRight: '16px' }}
      />

      <div style={{ float: 'none', overflow: 'hidden' }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={handleRate}
          disabled={rating === 0 || reportRatingRound === undefined}
        >
          Add Rating {rateText()}
        </Button>
      </div>

     <IPFSFileListContainer app={app}/>

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setManageAppGlobalState
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GreenVerifierPage);
