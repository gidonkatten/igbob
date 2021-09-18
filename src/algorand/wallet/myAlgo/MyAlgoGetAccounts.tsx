import React from 'react';
import { connect } from 'react-redux';
import { setAccountAddresses, setSelectedAccount } from '../../../redux/actions/actions';
import { myAlgoWallet } from './MyAlgoWallet';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import { getAccountInformation } from '../../account/Account';

interface GetAccountsProps {
  setAccountAddresses: typeof setAccountAddresses;
  setSelectedAccount: typeof setSelectedAccount;
}

const MyAlgoGetAccounts = (props: GetAccountsProps) => {
  const { setAccountAddresses, setSelectedAccount } = props;
  const { getAccessTokenSilently } = useAuth0();

  const connectToMyAlgo = async() => {
    try {
      // Connect to MyAlgo
      const accounts = await myAlgoWallet.connect();
      const addresses = accounts.map(account => account.address);

      // Update account addresses in db
      const accessToken = await getAccessTokenSilently();
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${accessToken}`);
      const response = await fetch("https://blockchain-bonds-server.herokuapp.com/accounts/addresses", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          "addresses": addresses
        })
      });
      const parseResponse = await response.json();
      setAccountAddresses(parseResponse.addresses);

      const firstAddr = parseResponse.addresses[0];
      if (firstAddr) {
        const userAccount = await getAccountInformation(firstAddr);
        setSelectedAccount(userAccount);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={connectToMyAlgo}
    >
      Connect
    </Button>
  )
};

const mapDispatchToProps = {
  setAccountAddresses,
  setSelectedAccount
};

export default connect(undefined, mapDispatchToProps)(MyAlgoGetAccounts);
