import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {
  getAppLocalTradeSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector, getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { App, AppState, Trade } from '../redux/types';
import { UserAccount } from '../redux/reducers/userReducer';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { AlgoNumberInput, StableCoinInputNoDecimal } from '../common/NumberInput';
import { setTrade, signTradeLSig, tradeBond } from '../algorand/bond/Trade';
import { useAuth0 } from '@auth0/auth0-react';
import { convertDateToUnixTime, formatAlgoDecimalNumber } from '../utils/Utils';
import { getAccountInformation } from '../algorand/account/Account';
import { getStateValue } from './Utils';

interface StateProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalTrade: (appId: number) => number;
}

interface DispatchProps {
}

interface OwnProps {
  app: App;
  trade: Trade;
}

type TradeProps = StateProps & DispatchProps & OwnProps;

function TradeBuyContainer(props: TradeProps) {

  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(0);
  const [bondsAvailable, setBondsAvailable] = useState<number>(0);

  const {
    app,
    trade,
    selectedAccount,
    getOptedIntoBond,
    getOptedIntoApp,
  } = props;

  const updateBondsAvailable = async () => {
    // Fetch seller account info
    getAccountInformation(trade.seller_address).then((acc: UserAccount) => {
      const { appsLocalState } = acc;
      const appId = app.app_id;
      if (appsLocalState.has(appId)) {
        const localState: AppState = appsLocalState.get(appId)!;
        setBondsAvailable(getStateValue("Trade", localState) / 1e6);
      }
    });
  }

  // Set max number of bonds that can be purchased on initial render
  useEffect(() => {
    updateBondsAvailable();
  }, []);

  const canTrade = () => {
    return app && trade &&
      noOfBondsToBuy !== 0 &&
      noOfBondsToBuy <= bondsAvailable &&
      getOptedIntoBond(app.bond_id) &&
      getOptedIntoApp(app.app_id);
  }

  const tradeTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (noOfBondsToBuy === 0) err = err.concat('Must specify more than 0 bonds\n');
    if (noOfBondsToBuy > bondsAvailable ) err = err.concat('Must be less than max number of available bonds\n');
    if (!getOptedIntoBond(app.bond_id)) err = err.concat('Must be opted into bond\n');
    if (!getOptedIntoApp(app.app_id)) err = err.concat('Must be opted into app\n');
    return err;
  }

  const handleSetTrade= async () => {
    if (!selectedAccount) return;

    await tradeBond(
      trade.lsig,
      trade.seller_address,
      selectedAccount.address,
      app.app_id,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy,
      trade.price,
    )

    // Update max no of bonds available
    updateBondsAvailable();
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
          {bondsAvailable} Bonds available <br/>
          BUY {noOfBondsToBuy} for ${(noOfBondsToBuy * trade.price).toFixed(6)}
        </Button>
      </Grid>

    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalTrade: getAppLocalTradeSelector(state),
});

const mapDispatchToProps = {
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeBuyContainer);
