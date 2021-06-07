import React from 'react';
import AppList from '../common/AppTable';
import { App } from '../redux/types';
import { BackButton } from '../common/BackButton';
import IssueBondForm from './IssueBondForm';
import Button from '@material-ui/core/Button';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';
import { IssuerPageNav } from './IssuerPageContainer';

interface IssuerPageProps {
  issuerPageNav: IssuerPageNav;
  enterAppView: (appId) => void;
  exitAppView: () => void;
  enterIssuanceView: () => void;
  exitIssuanceView: () => void;
  app?: App;
  reportRatingRound?: number;
  uploadToIPFS: (event: any) => void;
  uploadText: string;
}

export function IssuerPage(props: IssuerPageProps) {

  const {
    issuerPageNav,
    enterAppView,
    exitAppView,
    enterIssuanceView,
    exitIssuanceView,
    app,
    reportRatingRound,
    uploadToIPFS,
    uploadText,
  } = props;

  const overviewView = (
    <div>

      <Typography variant="h3">Issuer For These Green Bonds</Typography>

      <AppList
        onClick={enterAppView}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={enterIssuanceView}
        style={{ marginTop: '16px' }}
        fullWidth
      >
        Issue new bond
      </Button>

    </div>
  )

  const issuanceView = (
    <div>
      <BackButton onClick={exitIssuanceView}/>
      <Typography variant="h3">Issue Bond</Typography>
      <IssueBondForm/>
    </div>
  );

  const manageView = app && (
    <div>

      <BackButton onClick={exitAppView}/>

      <Button
        variant="contained"
        color="primary"
        component="label"
        fullWidth
        style={{ textTransform: 'none' }}
        onChange={uploadToIPFS}
        disabled={reportRatingRound === undefined}
      >
        {uploadText}
        <input type="file" accept="application/pdf" hidden/>
      </Button>

      <IPFSFileListContainer app={app}/>

    </div>
  );

  return (
    <div className={"page-content"}>
      {issuerPageNav === IssuerPageNav.OVERVIEW ? overviewView : null}
      {issuerPageNav === IssuerPageNav.ISSUANCE ? issuanceView : null}
      {issuerPageNav === IssuerPageNav.MANAGE ? manageView : null}
    </div>
  );
}
