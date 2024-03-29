import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { formatAlgoDecimalNumber } from '../utils/Utils';
import { buyBond } from '../algorand/bond/Buy';
import { getAccountInformation, getAssetBalance } from '../algorand/account/Account';
import { App, UserAccount } from '../redux/types';
import { connect } from 'react-redux';
import { setAppBondEscrowBalance, setSelectedAccount } from '../redux/actions/actions';
import {
  getAppLocalFrozenSelector,
  getBondBalanceSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import TextField from '@material-ui/core/TextField';
import { AlgoNumberInput } from '../common/NumberInput';
import { getStateValue } from './Utils';
import { NotificationManager } from 'react-notifications';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number | bigint;
  getAppLocalFrozen: (appId: number) => boolean;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setAppBondEscrowBalance: typeof setAppBondEscrowBalance;
}

interface OwnProps {
  app: App;
}

type BuyProps = StateProps & DispatchProps & OwnProps;

function BuyContainer(props: BuyProps) {

  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(0);

  const {
    app,
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
    getAppLocalFrozen,
    setSelectedAccount,
    setAppBondEscrowBalance,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app.start_buy_date) && (currentTime < app.end_buy_date);
  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  const canBuy = () => {
    if (!app) return false;

    return inBuyWindow &&
      getOptedIntoBond(app.bond_id) &&
      noOfBondsToBuy !== 0 &&
      getStateValue('frozen', app.app_global_state) > 0 &&
      !getAppLocalFrozen(app.app_id);
  }

  const buyTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (!inBuyWindow) err = err.concat('Not in buy window\n');
    if (!getOptedIntoBond(app.bond_id)) err = err.concat('Have not opted into bond\n');
    if (noOfBondsToBuy === 0) err = err.concat('Must specify more than 0 bonds\n');
    if (getStateValue('frozen', app.app_global_state) === 0) err = err.concat('All accounts are frozen\n');
    if (getAppLocalFrozen(app.app_id)) err = err.concat('Your account is frozen\n');
    return err;
  }

  const handleBuy = async () => {
    if (!selectedAccount || !app) return;
    const txId = await buyBond(
      selectedAccount.address,
      app.app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy * 1e6,
      app.bond_cost
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setAppBondEscrowBalance(app.app_id, getAssetBalance(acc, app.bond_id) as number)
    );
    NotificationManager.success(
      `Bought ${noOfBondsToBuy} for $${(noOfBondsToBuy * app.bond_cost).toFixed(6)}`,
      "Bought Green Bonds",
      5000,
      () => window.open("https://testnet.algoexplorer.io/tx/" + txId, '_blank')
  );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            label="No. of Bonds To Buy:"
            value={noOfBondsToBuy}
            onChange={e => setNoOfBondsToBuy(Number(e.target.value))}
            required
            fullWidth
            InputLabelProps={{ required: false }}
            InputProps={{ inputComponent: AlgoNumberInput }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={7}>
        <div title={buyTooltip()}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            disabled={!canBuy()}
            onClick={handleBuy}
          >
            You own {formatAlgoDecimalNumber(bondBalance)} bonds <br/>
            BUY {noOfBondsToBuy} bonds for ${(noOfBondsToBuy * app.bond_cost).toFixed(6)}
          </Button>
        </div>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getAppLocalFrozen: getAppLocalFrozenSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setAppBondEscrowBalance,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(BuyContainer);
