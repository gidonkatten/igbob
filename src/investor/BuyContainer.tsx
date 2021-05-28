import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import { formatStablecoin } from '../utils/Utils';
import { buyBond } from '../algorand/bond/Buy';
import { getAccountInformation, getAssetBalance } from '../algorand/account/Account';
import { App } from '../redux/types';
import { UserAccount } from '../redux/reducers/userReducer';
import { connect } from 'react-redux';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  getBondBalanceSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number | bigint;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
}

interface OwnProps {
  app: App;
  setBondEscrowBalance: (balance: number | bigint) => void;
}

type BuyProps = StateProps & DispatchProps & OwnProps;

function BuyContainer(props: BuyProps) {

  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(1);

  const {
    app,
    setBondEscrowBalance,
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
    setSelectedAccount
  } = props;

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app.start_buy_date) && (currentTime < app.end_buy_date);
  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  const canBuy = () => {
    if (!app) return false;

    return inBuyWindow && getOptedIntoBond(app.bond_id);
  }

  const buyTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (!inBuyWindow) err = err.concat('Not in buy window\n')
    if (!getOptedIntoBond(app.bond_id)) err = err.concat('Have not opted into bond\n')
    return err;
  }

  const handleBuy = async () => {
    if (!selectedAccount || !app) return;
    await buyBond(
      selectedAccount.address,
      app.app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy,
      app.bond_cost
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id) as number)
    );
  }

  return (
    <>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel>No. of Bonds To Buy:</InputLabel>
          <Input
            value={noOfBondsToBuy}
            onChange={e => setNoOfBondsToBuy(parseInt(e.target.value))}
            type="number"
            name="noOfBondsToBuy"
            fullWidth
            required
            inputProps={{ min: 1 }}
            disabled={!canBuy()}
            title={buyTooltip()}
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
            You own {bondBalance} bonds <br/>
            BUY {noOfBondsToBuy} bonds for ${formatStablecoin(noOfBondsToBuy * app.bond_cost)}
          </Button>
        </div>
      </Grid>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(BuyContainer);
