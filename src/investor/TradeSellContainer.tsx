import React, { useState } from 'react';
import { connect } from 'react-redux'
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {
  getAppLocalTradeSelector,
  getBondBalanceSelector,
  getOptedIntoAppSelector,
  selectedAccountSelector
} from '../redux/selectors/userSelector';
import { App, UserAccount } from '../redux/types';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { AlgoNumberInput, StableCoinInputNoDecimal } from '../common/NumberInput';
import { setTrade, signTradeLSig } from '../algorand/bond/Trade';
import { useAuth0 } from '@auth0/auth0-react';
import { convertDateToUnixTime, formatAlgoDecimalNumber } from '../utils/Utils';
import { getAccountInformation } from '../algorand/account/Account';
import { setSelectedAccount } from '../redux/actions/actions';
import { NotificationManager } from 'react-notifications';

interface StateProps {
  selectedAccount?: UserAccount;
  getBondBalance: (bondId: number) => number | bigint;
  getOptedIntoApp: (appId: number) => boolean;
  getAppLocalTrade: (appId: number) => number;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount
}

interface OwnProps {
  app: App;
}

type TradeProps = StateProps & DispatchProps & OwnProps;

function TradeSellContainer(props: TradeProps) {

  const [noOfBonds, setNoOfBonds] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState(null);

  const {
    app,
    selectedAccount,
    getBondBalance,
    getAppLocalTrade,
    setSelectedAccount,
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  const bondBalance: number = app ? (getBondBalance(app.bond_id) as number) : 0;
  const currentTime: number = Date.now() / 1000;
  const inTradeWindow = app && (currentTime > app.end_buy_date);

  const handleExpiryDateChange = (date) => setExpiryDate(date)

  const canTrade = () => {
    return app && bondBalance !== 0 && inTradeWindow;
  }

  const tradeTooltip = () => {
    if (!app) return undefined;

    let err = '';
    if (bondBalance === 0) err = err.concat('Do not own any bonds\n')
    if (!inTradeWindow) err = err.concat('Can only trade bond after initial buy period\n')
    return err;
  }

  const handleSetTrade= async () => {
    if (!selectedAccount) return;
    await setTrade(
      app.app_id,
      selectedAccount.address,
      noOfBonds * 1e6,
    );

    // Update max no of bonds to be traded
    const userAccount = await getAccountInformation(selectedAccount.address);
    setSelectedAccount(userAccount);
    NotificationManager.success(`Can trade up to ${noOfBonds} bonds`, "Updated Trade Vault Balance");
  };

  const handleGenTradeLSig = async () => {
    if (!selectedAccount || !expiryDate) return;

    const accessToken = await getAccessTokenSilently();
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);

    const genTradeResponse = await fetch("https://igbob.herokuapp.com/trades/generate-trade", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "userAddress": selectedAccount.address,
        "mainAppId": app.app_id,
        "bondId": app.bond_id,
        "expiry": convertDateToUnixTime(expiryDate!),
        "price": price,
      })
    });

    const { tradeId, tradeLsig } = await genTradeResponse.json();
    const lsig = await signTradeLSig(
      Uint8Array.from(Object.values(tradeLsig)),
      selectedAccount.address
    );

    await fetch("https://igbob.herokuapp.com/trades/add-trade-lsig", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "tradeId": tradeId,
        "lsig": Object.values(lsig),
      })
    });
    NotificationManager.success('', "Created Trade Offer");
  };

  return (
    <Grid container spacing={3}>

      {/*Row split into halves*/}
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            label="Max No. of Bonds To Trade:"
            value={noOfBonds}
            onChange={e => setNoOfBonds(Number(e.target.value))}
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
          Currently Up To {formatAlgoDecimalNumber(getAppLocalTrade(app.app_id))} Of Your Bonds Can Be Traded<br/>
          Set Max No. of Bonds To Trade To {noOfBonds}
        </Button>
      </Grid>

      {/*Row split into thirds*/}
      <Grid item xs={4}>
        <TextField
          label="Price Per Bond:"
          value={price}
          onChange={e => setPrice(parseInt(e.target.value))}
          required
          fullWidth
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StableCoinInputNoDecimal }}
        />
      </Grid>

      <Grid item xs={4}>
        <KeyboardDateTimePicker
          clearable
          label="Expiry date:"
          value={expiryDate}
          onChange={handleExpiryDateChange}
          disablePast
          format="yyyy/MM/dd HH:mm"
          fullWidth
          InputLabelProps={{ required: false }}
        />
      </Grid>

      <Grid item xs={4} title={tradeTooltip()}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={handleGenTradeLSig}
          disabled={expiryDate === null || !canTrade()}
        >
          Generate Trade Logic Signature
        </Button>
      </Grid>

    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getAppLocalTrade: getAppLocalTradeSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(TradeSellContainer);
