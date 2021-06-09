import React, { useState } from 'react';
import { connect } from 'react-redux'
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {
  getAppLocalFrozenSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { App, Trade, UserAccount } from '../redux/types';
import { AlgoNumberInput } from '../common/NumberInput';
import { tradeBond } from '../algorand/bond/Trade';
import { formatAlgoDecimalNumber } from '../utils/Utils';
import { getAccountInformation, getAppAccountTrade } from '../algorand/account/Account';
import { getStateValue } from './Utils';
import { setSelectedAccount, setTradeAvailableBalance } from '../redux/actions/actions';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalFrozen: (appId: number) => boolean;
  getBondBalance: (bondId: number) => number | bigint;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setTradeAvailableBalance: typeof setTradeAvailableBalance;
}

interface OwnProps {
  app: App;
  trade: Trade;
}

type TradeProps = StateProps & DispatchProps & OwnProps;

function TradeBuyContainer(props: TradeProps) {

  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(0);

  const {
    app,
    trade,
    selectedAccount,
    getOptedIntoBond,
    getOptedIntoApp,
    getAppLocalFrozen,
    getBondBalance,
    setSelectedAccount,
    setTradeAvailableBalance,
  } = props;

  const currentTime: number = Date.now() / 1000;
  const bondBalance: number = getBondBalance(app.bond_id) as number;

  const canTrade = () => {
    return trade.seller_balance &&
      noOfBondsToBuy !== 0 &&
      noOfBondsToBuy <= (trade.seller_balance / 1e6) &&
      getOptedIntoBond(app.bond_id) &&
      getOptedIntoApp(app.app_id) &&
      currentTime < trade.expiry_date &&
      !trade.seller_frozen &&
      getStateValue('Frozen', app.app_global_state) > 0 &&
      !getAppLocalFrozen(app.app_id);
  }

  const tradeTooltip = () => {
    if (!trade.seller_balance) return undefined;

    let err = '';
    if (noOfBondsToBuy === 0) err = err.concat('Must specify more than 0 bonds\n');
    if (noOfBondsToBuy > (trade.seller_balance / 1e6) ) err = err.concat('Must be less than number of available bonds\n');
    if (!getOptedIntoBond(app.bond_id)) err = err.concat('Must be opted into bond\n');
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Must be opted into app\n');
    if (currentTime >= trade.expiry_date) err = err.concat("Trade offer has expired\n");
    if (trade.seller_frozen) err = err.concat("Seller's account is frozen\n");
    if (getStateValue('Frozen', app.app_global_state) === 0) err = err.concat('All accounts are frozen\n');
    if (getAppLocalFrozen(app.app_id)) err = err.concat('Your account is frozen\n');
    return err;
  }

  const handleSetTrade = async () => {
    if (!selectedAccount) return;

    await tradeBond(
      trade.lsig,
      trade.lsig_program,
      trade.seller_address,
      selectedAccount.address,
      app.app_id,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy * 1e6,
      trade.price,
    )
    // Update bond balance and max no of bonds available
    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAppAccountTrade(trade.seller_address, trade.app_id, trade.bond_id).then(appAccountTrade => {
      const { balance, frozen } = appAccountTrade;
      setTradeAvailableBalance(trade.trade_id, balance, frozen);
    })
  };

  return (
    <Grid container spacing={3}>

      <Grid item xs={12}>
        <TextField
          label="Seller Address:"
          defaultValue={trade.seller_address}
          required
          fullWidth
          InputProps={{ readOnly: true }}
          InputLabelProps={{ required: false }}
          style={{ margin: '8px 0px' }}
        />
      </Grid>

      {/*Row split into halves*/}
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            label="No. of Bonds To Buy:"
            value={noOfBondsToBuy}
            onChange={e => setNoOfBondsToBuy(Number(e.target.value))}
            fullWidth
            InputLabelProps={{ required: false }}
            InputProps={{ inputComponent: AlgoNumberInput }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={7} title={tradeTooltip()}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          disabled={!canTrade()}
          onClick={handleSetTrade}
        >
          You own {formatAlgoDecimalNumber(bondBalance)} bonds <br/>
          {(trade.seller_balance ? (trade.seller_balance / 1e6) : 0).toFixed(6)} bonds available <br/>
          BUY {noOfBondsToBuy} bonds for ${(noOfBondsToBuy * trade.price).toFixed(6)}
        </Button>
      </Grid>

    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalFrozen: getAppLocalFrozenSelector(state),
  getBondBalance: getBondBalanceSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setTradeAvailableBalance,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeBuyContainer);
