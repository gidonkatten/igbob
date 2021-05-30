import React from 'react';
import AppList from '../common/AppTable';
import { UserAccount } from '../redux/reducers/userReducer';
import Rating from '@material-ui/lab/Rating';
import { App, AppsTableElem } from '../redux/types';
import Button from '@material-ui/core/Button';
import { BackButton } from '../common/BackButton';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';

interface GreenVerifierPageProps {
  selectedAccount?: UserAccount;
  inOverview: boolean;
  enterAppView: (appId: number) => void;
  exitAppView: () => void;
  app?: App;
  getApp: (appId: number) => App | undefined;
  rating: number | null;
  setRating: (rating: number | null) => void;
  reportRatingRound?: number;
  handleRate: () => void;
  rateText: string;
}

export function GreenVerifierPage(props: GreenVerifierPageProps) {

  const {
    selectedAccount,
    inOverview,
    enterAppView,
    exitAppView,
    app,
    getApp,
    rating,
    setRating,
    reportRatingRound,
    handleRate,
    rateText,
  } = props;

  const appsList = (
    <div>
      <Typography variant="h3">Green Verifier For These Green Bonds</Typography>
      <AppList
        onClick={enterAppView}
        appFilter={(elem: AppsTableElem) => getApp(elem.id)!.green_verifier_address === (selectedAccount ? selectedAccount.address : undefined)}
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
          Add Rating {rateText}
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
