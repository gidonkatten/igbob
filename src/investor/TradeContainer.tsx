import React, { useState } from 'react';
import { connect } from 'react-redux'
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { AlgoNumberInput } from '../common/AlgoNumberInput';
import {
  getAppLocalTradeSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector
} from '../redux/selectors/userSelector';
import { App } from '../redux/types';
import { UserAccount } from '../redux/reducers/userReducer';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { StablecoinInput } from '../common/StablecoinInput';
import { setTrade } from '../algorand/bond/Trade';

interface StateProps {
  selectedAccount?: UserAccount;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalTrade: (appId: number) => number;
}

interface DispatchProps {
}

interface OwnProps {
  app: App;
}

type TradeProps = StateProps & DispatchProps & OwnProps;

function TradeContainer(props: TradeProps) {

  const [noOfBonds, setNoOfBonds] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState(null);

  const {
    app,
    selectedAccount,
    getBondBalance,
    getAppLocalTrade,
  } = props;

  const handleExpiryDateChange = (date) => setExpiryDate(date)

  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;

  const canTrade = () => {
    return app && bondBalance !== 0;
  }

  const tradeTooltip = () => {
    if (bondBalance === 0) return 'Do not own any bonds\n';
    return undefined
  }

  const handleSetTrade= async () => {
    if (!selectedAccount || !app) return;
    await setTrade(
      app.app_id,
      selectedAccount.address,
      noOfBonds,
    );
  };

  const handleGenTradeLSig= async () => {
    if (!selectedAccount || !app) return;
    // await genTradeLsig();
  };


  return (
    <div>

      {/*/!*Row split into halves*!/*/}
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            label="No. of Bonds Willing To Trade:"
            value={noOfBonds}
            onChange={e => setNoOfBonds(Number(e.target.value))}
            fullWidth
            InputLabelProps={{ required: false }}
            InputProps={{ inputComponent: AlgoNumberInput }}
            disabled={!canTrade()}
            title={tradeTooltip()}
          />
        </FormControl>
      </Grid>

      <Grid item xs={7}>
        <div title={tradeTooltip()}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            style={{ textTransform: 'none' }}
            disabled={!canTrade()}
            onClick={handleSetTrade}
          >
            Current: {getAppLocalTrade(app.app_id)} <br/>
            Set No. of Bonds Willing To Trade To {noOfBonds}
          </Button>
        </div>
      </Grid>

      {/*Row split into thirds*/}
      <Grid item xs={4}>
        <TextField
          label="Trade Price Per Bond:"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          required
          fullWidth
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StablecoinInput }}
        />
      </Grid>

      <Grid item xs={4}>
        <KeyboardDateTimePicker
          clearable
          label="Trade Offer Expiry date:"
          value={expiryDate}
          onChange={handleExpiryDateChange}
          disablePast
          format="yyyy/MM/dd HH:mm"
          fullWidth
          InputLabelProps={{ required: false }}
        />
      </Grid>

      <Grid item xs={4}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={handleGenTradeLSig}
        >
          Generate Trade Logic Signature
        </Button>
      </Grid>

    </div>
  );
}

const mapStateToProps = (state: any) => ({
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalTrade: getAppLocalTradeSelector(state),
});

const mapDispatchToProps = {
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeContainer);