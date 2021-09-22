import React from 'react';
import Button from '@material-ui/core/Button';
import { getAccountInformation } from '../algorand/account/Account';
import { App, UserAccount } from '../redux/types';
import { connect } from 'react-redux';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { optIntoAsset } from '../algorand/assets/Asset';
import { optIntoApp } from '../algorand/bond/OptIntoApp';
import { NotificationManager } from 'react-notifications';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getOptedIntoApp: (appId: number) => boolean;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
}

interface OwnProps {
  app: App;
}

type RegisterProps = StateProps & DispatchProps & OwnProps;

function RegisterContainer(props: RegisterProps) {

  const {
    app,
    selectedAccount,
    getOptedIntoBond,
    getOptedIntoApp,
    setSelectedAccount,
  } = props;

  // BOND OPT IN
  const handleAssetOptIn = async () => {
    if (!selectedAccount || !app) return;
    const txId = await optIntoAsset(app.bond_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    NotificationManager.success(
      '',
      "Opted Into Green Bond",
      5000,
      () => window.open("https://testnet.algoexplorer.io/tx/" + txId, '_blank')
    );
  }

  // APP OPT IN
  const handleAppOptIn = async () => {
    if (!selectedAccount || !app) return;
    const txId = await optIntoApp(app.app_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    NotificationManager.success(
      '', "Opted Into App",
      5000,
      () => window.open("https://testnet.algoexplorer.io/tx/" + txId, '_blank')
    );
  }

  const canRegister = () => {
    if (!app) return false;

    return !getOptedIntoBond(app.bond_id) || !getOptedIntoApp(app.app_id)
  }

  const handleRegister = async () => {
    if (!selectedAccount || !app) return;

    if (!getOptedIntoBond(app.bond_id)) await handleAssetOptIn();
    if (!getOptedIntoApp(app.app_id)) await handleAppOptIn();
  }

  return (
    <div title={!canRegister() ? 'Already opted into bond and application' : undefined}>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        disabled={!canRegister()}
        title={!canRegister() ? 'Already opted into bond and application' : undefined}
        onClick={handleRegister}
      >
        Register
      </Button>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(RegisterContainer);
