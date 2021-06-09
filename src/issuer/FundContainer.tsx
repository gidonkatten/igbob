import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { formatAlgoDecimalNumber } from '../utils/Utils';
import { getAccountInformation, getStablecoinBalance } from '../algorand/account/Account';
import { App, UserAccount } from '../redux/types';
import { connect } from 'react-redux';
import { setAppDefaulted, setAppStablecoinEscrowBalance, setSelectedAccount } from '../redux/actions/actions';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import TextField from '@material-ui/core/TextField';
import { StableCoinInputWithDecimal } from '../common/NumberInput';
import { transferAsset } from '../algorand/assets/Asset';
import { STABLECOIN_ID } from '../algorand/utils/Utils';
import { Defaulted, getHasDefaulted } from '../investor/Utils';

interface StateProps {
  selectedAccount?: UserAccount;
}

interface DispatchProps {
  setSelectedAccount: typeof setSelectedAccount;
  setAppStablecoinEscrowBalance: typeof setAppStablecoinEscrowBalance;
  setAppDefaulted: typeof setAppDefaulted;
}

interface OwnProps {
  app: App
}

type FundContainerProps = StateProps & DispatchProps & OwnProps;

function FundContainer(props: FundContainerProps) {

  const [noOfStablecoins, setNoOfStablecoins] = useState<number>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number>(0);
  const [defaultText, setDefaultText] = useState<string>('');

  const {
    app,
    selectedAccount,
    setSelectedAccount,
    setAppStablecoinEscrowBalance,
    setAppDefaulted,
  } = props;

  useEffect(() => {
    setStablecoinEscrowBalance(app.stablecoin_escrow_balance === undefined ? 0 : app.stablecoin_escrow_balance)
  }, [app.stablecoin_escrow_balance]);

  useEffect(() => {
    if (!app) setDefaultText('');
    const defaulted: Defaulted | undefined = app.defaulted;

    if (!defaulted) setDefaultText('Not defaulted');
    else setDefaultText(`Defaulted at round ${defaulted.round} due to ${defaulted.isDueToPrincipal ? 'principal' : 'coupon'} payment, owing $${formatAlgoDecimalNumber(defaulted.owedAtRound)}`)
  }, [app.defaulted]);

  const handleFund = async () => {
    if (!selectedAccount || !app) return;
    await transferAsset(
      STABLECOIN_ID,
      selectedAccount.address,
      app.stablecoin_escrow_address,
      noOfStablecoins * 1e6,
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc => {
      setAppStablecoinEscrowBalance(app.app_id, getStablecoinBalance(acc) as number);
      setAppDefaulted(app.app_id, getHasDefaulted(app));
    });
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            label="Amount To Fund:"
            value={noOfStablecoins}
            onChange={e => setNoOfStablecoins(Number(e.target.value))}
            required
            fullWidth
            InputLabelProps={{ required: false }}
            InputProps={{ inputComponent: StableCoinInputWithDecimal }}
          />
        </FormControl>
      </Grid>

      <Grid item xs={7}>
        <Button
          variant="outlined"
          color={app.defaulted ? "secondary" : "primary"}
          fullWidth
          style={{ textTransform: 'none' }}
          onClick={handleFund}
        >
          Current escrow balance: ${formatAlgoDecimalNumber(stablecoinEscrowBalance)} <br/>
          {defaultText} <br/>
          FUND additional ${noOfStablecoins.toFixed(6)}
        </Button>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setAppStablecoinEscrowBalance,
  setAppDefaulted,
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(FundContainer);
