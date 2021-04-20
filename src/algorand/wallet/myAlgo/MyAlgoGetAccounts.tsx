import React from 'react';
import { connect } from 'react-redux';
import { setAccountAddresses } from '../../../redux/actions/actions';
import { myAlgoWallet } from './MyAlgoWallet';

interface GetAccountsProps {
  addresses: string[];
  setAccountAddresses: typeof setAccountAddresses;
}

const AlgoSignerGetAccounts = (props: GetAccountsProps) => {

  const connectToMyAlgo = async() => {
    try {
      const accounts = await myAlgoWallet.connect();
      const addresses = accounts.map(account => account.address);
      props.setAccountAddresses(addresses);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button onClick={connectToMyAlgo}>Connect</button>
  )
};

const mapStateToProps = (state: any) => ({
  addresses: state.investorReducer.addresses
});

const mapDispatchToProps = {
  setAccountAddresses,
};

export default connect(mapStateToProps, mapDispatchToProps)(AlgoSignerGetAccounts);