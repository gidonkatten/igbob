import React from 'react';
import { connect } from 'react-redux';
import MyAlgoGetAccounts from '../algorand/wallet/myAlgo/MyAlgoGetAccounts';
import { setSelectedAddress } from '../redux/actions/actions';

interface HomePageProps {
  addresses: string[];
  selectedAddress: string;
  setSelectedAddress: typeof setSelectedAddress
}

function SettingsPage(props: HomePageProps) {
  const { addresses, selectedAddress, setSelectedAddress } = props;

  const addressesListed = (
    <ul>
      {addresses.map((addr) => {
        return <li key={addr}>Address: {addr}</li>
      })}
    </ul>
  )

  const selectAddress = (
    <select value={selectedAddress} onChange={e => setSelectedAddress(e.target.value)}>
      {addresses.map((addr) => {
        return <option key={addr} value={addr}>{addr}</option>
      })}
    </select>
  )

  return (
    <div>
      <h3>Instructions</h3>
      <p>
        Connect accounts by creating a &nbsp;
        <a
          href="https://wallet.myalgo.com/home"
          target="_blank"
          rel="noopener noreferrer"
        >
          MyAlgo Account
        </a>
        &nbsp; and adding TestNet Wallets. When you are done, use the button
        below and choose which addresses you want to be able to interact with
        the application from.
      </p>
      <p>
        You can edit which accounts are connected by disconnecting from this site on
        MyAlgo and reconnecting using the button below.
      </p>
      <h3>Connected Accounts</h3>
      {addresses.length > 0 ?
        addressesListed :
        <p>No addresses</p>
      }
      <MyAlgoGetAccounts/>
      <h3>Selected Address</h3>
      {addresses.length > 0?
        selectAddress :
        <p>No addresses</p>
      }
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.userReducer.addresses,
  selectedAddress: state.userReducer.selectedAddress
});

const mapDispatchToProps = {
  setSelectedAddress
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
