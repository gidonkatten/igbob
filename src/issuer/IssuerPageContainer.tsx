import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { App, UserAccount } from '../redux/types';
import { getAppSelector } from '../redux/selectors/bondSelector';
import { IPFSAlgoWrapper } from '../ipfs/IPFSAlgoWrapper';
import { getReportRatingRound } from '../investor/Utils';
import { IssuerPage } from './IssuerPage';
import { FETCH_APPS_FILTER, fetchApps } from '../common/Utils';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps } from '../redux/actions/actions';

export enum IssuerPageNav {
  OVERVIEW,
  ISSUANCE,
  MANAGE
}

interface StateProps {
  selectedAccount?: UserAccount;
  getApp: (appId: number) => App | undefined;
}

interface DispatchProps {
  setApps: typeof setApps;
}

interface OwnProps {}

type IssuerPageContainerProps = StateProps & DispatchProps & OwnProps;

function IssuerPageContainer(props: IssuerPageContainerProps) {

  const [issuerPageNav, setIssuerPageNav] = useState<IssuerPageNav>(IssuerPageNav.OVERVIEW);
  const [app, setApp] = useState<App>();

  const { selectedAccount, getApp, setApps } = props;
  const { getAccessTokenSilently } = useAuth0();

  // Fetch apps for which selected address is issuer
  useEffect(() => {
    if (!selectedAccount) return;

    getAccessTokenSilently().then(accessToken => {
      fetchApps(accessToken, setApps, FETCH_APPS_FILTER.ISSUER, selectedAccount!.address);
    })

    // Clean up
    return () => { setApps([]) };
  }, [selectedAccount]);

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
    if (reportRatingRound === undefined) return 'Upload PDF Not Available At This Time';
    if (reportRatingRound === 0) return 'Upload PDF For Use of Proceeds'
    return 'Upload PDF For Report ' + reportRatingRound;
  }

  const uploadToIPFS = async (event: any) => {
    if (!selectedAccount || !app || reportRatingRound === undefined) return;

    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    // Check file is defined and upload
    if (!file) return;
    await new IPFSAlgoWrapper().addData(
      file,
      selectedAccount.address,
      app.manage_app_id,
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
      app={app}
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

const mapDispatchToProps = {
  setApps,
}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssuerPageContainer);
