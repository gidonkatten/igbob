import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { UserAccount } from '../redux/reducers/user';
import { getAccountInformation } from '../algorand/account/Account';
import { setSelectedAccount } from '../redux/actions/actions';
import {
  optedIntoStablecoinSelector,
  selectedAccountSelector,
  stablecoinBalanceSelector
} from '../redux/selectors/selectors';
import { formatStablecoin } from '../utils/Utils';
import Button from '@material-ui/core/Button';

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

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
        <h3>Selected Address</h3>
        <p>
          {selectedAccount ? <>{selectedAccount.address}</> : <>No address selected</>}
        </p>
      </div>

      <div>
        <h3>Algo Balance</h3>
        <p>Current balance is {selectedAccount ? selectedAccount.algoBalance : 0} algos</p>
        <p>
          Can use TestNet algo
          <Button
            href="https://bank.testnet.algorand.network"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
            dispenser
          </Button>
          to add 10 algos for transaction and minimum balance fees.
        </p>
      </div>

      <div>
        <h3>Stablecoin Balance</h3>
        {selectedAccount && optedIntoStablecoin ?
          <div>
            <p>Current balance is ${formatStablecoin(stablecoinBalance)}</p>
            <form onSubmit={handleSubmit}>
              <p>Can use TestNet stablecoin dispenser below to add $1000 for bond payments.</p>
              <p><Button variant="contained" color="primary" type="submit" disabled={!selectedAccount}>Fund</Button></p>
            </form>
          </div> :
          <p>Go to settings to opt in account to the stablecoin asset</p>
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
