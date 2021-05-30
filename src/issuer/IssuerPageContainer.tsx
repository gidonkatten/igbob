import React, { useState } from 'react';
import { connect } from 'react-redux';
import { UserAccount } from '../redux/reducers/userReducer';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { App } from '../redux/types';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { getReportRatingRound } from '../investor/Utils';
import { IssuerPage } from './IssuerPage';

export enum IssuerPageNav {
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

type IssuerPageContainerProps = StateProps & DispatchProps & OwnProps;

function IssuerPageContainer(props: IssuerPageContainerProps) {

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

  const reportRatingRound: number | undefined = app ? getReportRatingRound(
    app.start_buy_date,
    app.end_buy_date,
    app.maturity_date,
    app.period
  ) : undefined;

  const uploadText = (): string => {
    if (reportRatingRound === undefined) return '';
    if (reportRatingRound === 0) return 'Use of Proceeds'
    return 'Report ' + reportRatingRound;
  }

  const uploadToIPFS = (event: any) => {
    if (!selectedAccount || !app || reportRatingRound === undefined) return;

    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    // Check file is defined and upload
    if (!file) return;
    new IPFSAlgoWrapper().addData(
      file,
      selectedAccount.address,
      app.manage_app_id,
      reportRatingRound
    );
  };

  return (
    <IssuerPage
      selectedAccount={selectedAccount}
      issuerPageNav={issuerPageNav}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      enterIssuanceView={enterIssuanceView}
      exitIssuanceView={exitIssuanceView}
      app={app}
      getApp={getApp}
      reportRatingRound={reportRatingRound}
      uploadToIPFS={uploadToIPFS}
      uploadText={uploadText()}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssuerPageContainer);
