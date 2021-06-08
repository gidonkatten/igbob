import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { App, UserAccount } from '../redux/types';
import { selectedAppSelector } from '../redux/selectors/bondSelector';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { getReportRatingRound } from '../investor/Utils';
import { IssuerPage } from './IssuerPage';
import { FetchAppsFilter, fetchApps } from '../common/Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { clearSelectedApp, setApps, setSelectedApp } from '../redux/actions/actions';

export enum IssuerPageNav {
  OVERVIEW,
  ISSUANCE,
  MANAGE
}

interface StateProps {
  selectedAccount?: UserAccount;
  selectedApp?: App;
}

interface DispatchProps {
  setApps: typeof setApps;
  clearSelectedApp: typeof clearSelectedApp;
  setSelectedApp: typeof setSelectedApp;
}

interface OwnProps {}

type IssuerPageContainerProps = StateProps & DispatchProps & OwnProps;

function IssuerPageContainer(props: IssuerPageContainerProps) {

  const [issuerPageNav, setIssuerPageNav] = useState<IssuerPageNav>(IssuerPageNav.OVERVIEW);

  const {
    selectedAccount,
    selectedApp,
    setApps,
    clearSelectedApp,
    setSelectedApp,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is issuer
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FetchAppsFilter.ISSUER, selectedAccount!.address);
    })

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount?.address]);

  const enterAppView = (appId) => {
    setIssuerPageNav(IssuerPageNav.MANAGE);
    setSelectedApp(appId);
  }

  const exitAppView = () => {
    setIssuerPageNav(IssuerPageNav.OVERVIEW);
    clearSelectedApp();
  }

  const enterIssuanceView = () => setIssuerPageNav(IssuerPageNav.ISSUANCE);

  const exitIssuanceView = () => setIssuerPageNav(IssuerPageNav.OVERVIEW);

  const reportRatingRound: number | undefined = selectedApp ?
    getReportRatingRound(selectedApp) :
    undefined;

  const uploadText = (): string => {
    if (reportRatingRound === undefined) return 'Upload PDF Not Available At This Time';
    if (reportRatingRound === 0) return 'Upload PDF For Use of Proceeds'
    return 'Upload PDF For Report ' + reportRatingRound;
  }

  const uploadToIPFS = async (event: any) => {
    if (!selectedAccount || !selectedApp || reportRatingRound === undefined) return;

    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    // Check file is defined and upload
    if (!file) return;
    await new IPFSAlgoWrapper().addData(
      file,
      selectedAccount.address,
      selectedApp.manage_app_id,
      reportRatingRound
    );

    // Get new uploaded docs TODO
  };

  return (
    <IssuerPage
      issuerPageNav={issuerPageNav}
      enterAppView={enterAppView}
      exitAppView={exitAppView}
      enterIssuanceView={enterIssuanceView}
      exitIssuanceView={exitIssuanceView}
      app={selectedApp}
      reportRatingRound={reportRatingRound}
      uploadToIPFS={uploadToIPFS}
      uploadText={uploadText()}
    />
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  selectedApp: selectedAppSelector(state),
});

const mapDispatchToProps = {
  setApps,
  clearSelectedApp,
  setSelectedApp,
}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssuerPageContainer);
