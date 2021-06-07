import React from 'react';
import AppList from '../common/AppTable';
import Rating from '@material-ui/lab/Rating';
import { App } from '../redux/types';
import Button from '@material-ui/core/Button';
import { BackButton } from '../common/BackButton';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';

interface GreenVerifierPageProps {
  inOverview: boolean;
  enterAppView: (appId: number) => void;
  exitAppView: () => void;
  app?: App;
  rating: number | null;
  setRating: (rating: number | null) => void;
  reportRatingRound?: number;
  handleRate: () => void;
  rateText: string;
}

export function GreenVerifierPage(props: GreenVerifierPageProps) {

  const {
    inOverview,
    enterAppView,
    exitAppView,
    app,
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
          variant="contained"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={handleRate}
          disabled={rating === 0 || reportRatingRound === undefined}
        >
          {rateText}
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
