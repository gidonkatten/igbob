import React from 'react';
import { UserAccount } from '../redux/reducers/userReducer';
import AppList from '../common/AppList';
import { App } from '../redux/types';
import { BackButton } from '../common/BackButton';
import IssueBondForm from './IssueBondForm';
import Button from '@material-ui/core/Button';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';
import { IssuerPageNav } from './IssuerPageContainer';

interface IssuerPageProps {
  selectedAccount?: UserAccount;
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
    selectedAccount,
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
        appFilter={(app: App) => app.issuer_address === (selectedAccount ? selectedAccount.address : undefined)}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={enterIssuanceView}
        style={{ marginTop: '16px' }}
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
        variant="outlined"
        color="primary"
        component="label"
        fullWidth
        style={{ textTransform: 'none' }}
        onChange={uploadToIPFS}
        disabled={reportRatingRound === undefined}
      >
        Upload PDF For {uploadText}
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
