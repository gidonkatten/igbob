import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { getAccountInformation } from '../algorand/account/Account';
import { App } from '../redux/types';
import { UserAccount } from '../redux/reducers/userReducer';
import { connect } from 'react-redux';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { optIntoApp } from '../algorand/bond/OptIntoApp';

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
    await optIntoAsset(app.bond_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  // APP OPT IN
  const handleAppOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoApp(app.app_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }


  return (
    <>
      {/*First Row*/}
      <Grid item xs={6}>
        <div title={getOptedIntoBond(app.bond_id) ? 'Already opted into bond' : undefined}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            disabled={getOptedIntoBond(app.bond_id)}
            onClick={handleAssetOptIn}
          >
            Opt into bond
          </Button>
        </div>
      </Grid>

      <Grid item xs={6}>
        <div title={getOptedIntoApp(app.bond_id) ? 'Already opted into application' : undefined}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            disabled={getOptedIntoApp(app.app_id)}
            onClick={handleAppOptIn}
          >
            Opt into application
          </Button>
        </div>
      </Grid>
    </>
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
