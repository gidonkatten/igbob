import React from 'react';
import AlgoSignerActionButton from './AlgoSignerActionButton';
import { connect } from 'react-redux';
import { setAccountAddresses } from '../../../redux/actions/actions';

interface GetAccountsProps {
  setAccountAddresses: typeof setAccountAddresses;
}

const AlgoSignerGetAccounts = (props: GetAccountsProps) => {

  const action = async () => {

    // @ts-ignore
    await AlgoSigner.connect({
      ledger: 'TestNet'
    });

    // @ts-ignore
    const accounts: { address: string }[] = await AlgoSigner.accounts({
      ledger: 'TestNet'
    });

    props.setAccountAddresses(accounts.map((acc) => acc.address));

    // return JSON.stringify(accounts, null, 2);
  };

  return <AlgoSignerActionButton title="Get Accounts" buttonText="Get Accounts" buttonAction={action}/>
};

const mapDispatchToProps = {
  setAccountAddresses,
};

export default connect(undefined, mapDispatchToProps)(AlgoSignerGetAccounts);