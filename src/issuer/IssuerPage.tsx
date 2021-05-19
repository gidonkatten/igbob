import React, { useState } from 'react';
import { connect } from 'react-redux';
import { UserAccount } from '../redux/reducers/userReducer';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import AppList from '../common/AppList';
import { App } from '../redux/types';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { BackButton } from '../common/BackButton';
import IssueBondForm from './IssueBondForm';
import Button from '@material-ui/core/Button';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { CouponRound, getUpcomingCouponRound } from '../investor/Utils';
import IPFSFileListContainer from '../common/IPFSFileListContainer';
import Typography from '@material-ui/core/Typography';

enum IssuerPageNav {
  OVERVIEW,
  ISSUANCE,
  MANAGE
}

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {}

interface OwnProps {}

type IssuerPageProps = StateProps & DispatchProps & OwnProps;

function IssuerPage(props: IssuerPageProps) {

  const [issuerPageNav, setIssuerPageNav] = useState<IssuerPageNav>(IssuerPageNav.OVERVIEW);
  const [app, setApp] = useState<App>();

  const { selectedAccount, getApp } = props;

  const enterAppView = (appId) => {
    setIssuerPageNav(IssuerPageNav.MANAGE);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  const exitAppView = () => {
    setIssuerPageNav(IssuerPageNav.OVERVIEW);
    setApp(undefined);
  }

  const enterIssuanceView = () => setIssuerPageNav(IssuerPageNav.ISSUANCE);

  const exitIssuanceView = () => setIssuerPageNav(IssuerPageNav.OVERVIEW);

  const couponRound: CouponRound | undefined = app ?
    getUpcomingCouponRound(app.end_buy_date, app.maturity_date, app.period) :
    undefined

  const uploadText = (): string => {
    if (!couponRound) return '';
    if (couponRound.round === 0) return 'Use of Proceeds'
    return 'Report ' + couponRound.round;
  }

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

  const uploadToIPFS = (event: any) => {
    if (!selectedAccount || !app || !couponRound) return;

    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    // Check file is defined and upload
    if (!file) return;
    new IPFSAlgoWrapper().addData(
      file,
      selectedAccount.address,
      app.manage_app_id,
      couponRound.round
    );
  };

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
        disabled={!couponRound}
      >
        Upload PDF For {uploadText()}
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

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssuerPage);
