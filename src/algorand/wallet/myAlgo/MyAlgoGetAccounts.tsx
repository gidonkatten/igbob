import React from 'react';
import { connect } from 'react-redux';
import { setAccountAddresses } from '../../../redux/actions/actions';
import { myAlgoWallet } from './MyAlgoWallet';
import { useAuth0 } from '@auth0/auth0-react';

interface GetAccountsProps {
  setAccountAddresses: typeof setAccountAddresses;
}

const MyAlgoGetAccounts = (props: GetAccountsProps) => {
  const { setAccountAddresses } = props;
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
      const response = await fetch("http://localhost:5000/accounts/addresses", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          "addresses": addresses
        })
      });

      // Update account addresses in state
      const parseResponse = await response.json();
      setAccountAddresses(parseResponse.addresses);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button onClick={connectToMyAlgo}>Connect</button>
  )
};

const mapDispatchToProps = {
  setAccountAddresses,
};

export default connect(undefined, mapDispatchToProps)(MyAlgoGetAccounts);