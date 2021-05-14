import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { UserAccount } from '../redux/reducers/userReducer';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import AppList from '../common/AppList';
import { App } from '../redux/types';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { BackButton } from '../common/BackButton';
import IssueBondForm from './IssueBondForm';
import Button from '@material-ui/core/Button';

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

  const appId = app ? app.app_id : 0;
  useEffect(() => {
    if (!app) return;

  }, [appId])

  const overviewView = (
    <div>

      <h3>Issuer For These Green Bonds</h3>
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
      <h3>Issue Bond</h3>
      <IssueBondForm/>
    </div>
  );

  const manageView = (
    <div>
      <BackButton onClick={exitAppView}/>
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
