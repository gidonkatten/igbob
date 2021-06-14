import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { getAccountInformation } from '../algorand/account/Account';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  optedIntoStablecoinSelector,
  selectedAccountSelector,
  stablecoinBalanceSelector
} from '../redux/selectors/userSelector';
import { formatAlgoDecimalNumber } from '../utils/Utils';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { UserAccount } from '../redux/types';

interface DashboardPageProps {
  selectedAccount?: UserAccount,
  optedIntoStablecoin: boolean,
  stablecoinBalance: number | bigint,
  setSelectedAccount: typeof setSelectedAccount;
}

function DashboardPage(props: DashboardPageProps) {

  const { selectedAccount, optedIntoStablecoin, stablecoinBalance, setSelectedAccount } = props;
  const { getAccessTokenSilently } = useAuth0();

  const updateSelectedAccount = (account?: UserAccount) => {
    if (account) getAccountInformation(account.address).then(acc => setSelectedAccount(acc));
  }

  // initial call then every 5 seconds to update state
  useEffect(() => {
    updateSelectedAccount(selectedAccount);
    const interval = setInterval(() => updateSelectedAccount(selectedAccount), 5000);
    return () => clearInterval(interval);
  }, [selectedAccount?.address]);

  const handleFund = async () => {
    if (!selectedAccount) return;

    const accessToken = await getAccessTokenSilently({ scope: "issue:bonds" });

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);
    const response = await fetch("https://igbob.herokuapp.com/fund/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ "addr": selectedAccount.address })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  return (
    <div className={"page-content"}>

      <div>
        <Typography variant="h4" gutterBottom>Selected Address</Typography>
        <Typography variant="body1" gutterBottom>
          {selectedAccount ? selectedAccount.address : 'No address selected'}
        </Typography>
      </div>

      <div>
        <Typography variant="h4" gutterBottom>Algo Balance</Typography>
        <Typography variant="body1" gutterBottom>
          Current balance is {selectedAccount ? selectedAccount.algoBalance : 0} algos
        </Typography>
        <Typography variant="body1" gutterBottom>
          Can use TestNet algo&nbsp;
          <a
            href="https://bank.testnet.algorand.network"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
           dispenser
          </a>
          &nbsp;to add 10 algos for transaction and minimum balance fees.
        </Typography>
      </div>

      <div>
        <Typography variant="h4" gutterBottom>Stablecoin Balance</Typography>
        {selectedAccount && optedIntoStablecoin ?
          <div>
            <Typography variant="body1" gutterBottom>
              Current balance is ${formatAlgoDecimalNumber(stablecoinBalance)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Can use TestNet stablecoin dispenser below to add $1000 for bond payments.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFund}
              disabled={!selectedAccount}
            >
              Fund
            </Button>
          </div> :
          <Typography variant="body1" gutterBottom>
            Go to settings to opt in account to the stablecoin asset
          </Typography>
        }
      </div>

    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  optedIntoStablecoin: optedIntoStablecoinSelector(state),
  stablecoinBalance: stablecoinBalanceSelector(state)
});

const mapDispatchToProps = {
  setSelectedAccount
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
