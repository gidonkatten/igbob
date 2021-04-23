import React from 'react';
import { connect } from 'react-redux';
import MyAlgoGetAccounts from '../algorand/wallet/myAlgo/MyAlgoGetAccounts';

interface HomePageProps {
  addresses: string[];
}

function SettingsPage(props: HomePageProps) {
  const { addresses } = props;

  return (
    <div>
      <MyAlgoGetAccounts/>
      <h3>Connected Accounts</h3>
      <ul>
        {addresses.map((addr) => {
          return <li key={addr}>Address: {addr}</li>
        })}
      </ul>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.investorReducer.addresses
});

export default connect(mapStateToProps, undefined)(SettingsPage);
