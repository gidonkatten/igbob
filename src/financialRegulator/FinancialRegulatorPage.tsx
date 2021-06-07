import React from 'react';
import { App, AppAccount } from '../redux/types';
import Typography from '@material-ui/core/Typography';
import AppList from '../common/AppTable';
import { BackButton } from '../common/BackButton';

interface FinancialRegulatorPageProps {
  inOverview: boolean;
  enterAppView: (appId: number) => void;
  exitAppView: () => void;
  app?: App;
  appAccounts: AppAccount[];
}

export function FinancialRegulatorPage(props: FinancialRegulatorPageProps) {

  const {
    inOverview,
    enterAppView,
    exitAppView,
    app,
    appAccounts,
  } = props;

  const appsList = (
    <div>
      <Typography variant="h3">Financial Regulator For These Green Bonds</Typography>
      <AppList
        onClick={enterAppView}
      />
    </div>
  )

  const appView = app && (
    <div>

      <BackButton onClick={exitAppView}/>

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}
