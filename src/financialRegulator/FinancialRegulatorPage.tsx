import React from 'react';
import { App, AppAccount } from '../redux/types';
import Typography from '@material-ui/core/Typography';
import AppList from '../common/AppTable';
import { BackButton } from '../common/BackButton';
import { AppAccountList } from './AppAccountList';
import Button from '@material-ui/core/Button';

interface FinancialRegulatorPageProps {
  inOverview: boolean;
  enterAppView: (appId: number) => void;
  exitAppView: () => void;
  app?: App;
  appAccounts: AppAccount[];
  isAllFrozen: boolean;
  freezeAll: (toFreeze: boolean) => void;
  freezeAddress: (toFreeze: boolean, addr: string) => void;
}

export function FinancialRegulatorPage(props: FinancialRegulatorPageProps) {

  const {
    inOverview,
    enterAppView,
    exitAppView,
    app,
    appAccounts,
    isAllFrozen,
    freezeAll,
    freezeAddress,
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

      <Button
        variant="contained"
        color={isAllFrozen ? "secondary" : "primary" }
        component="label"
        fullWidth
        style={{ textTransform: 'none' }}
        onClick={() => freezeAll(!isAllFrozen)}
      >
        {isAllFrozen ? 'Unfreeze all bonds' : 'Freeze all bonds'}
      </Button>

      <AppAccountList
        appAccounts={appAccounts}
        freezeAddress={freezeAddress}
      />

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}
