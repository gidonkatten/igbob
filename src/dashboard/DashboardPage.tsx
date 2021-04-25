import React from 'react';
import { connect } from 'react-redux';

interface DashboardPageProps {
  addresses: string[];
}

function DashboardPage(props: DashboardPageProps) {
  const { addresses } = props;

  return (
    <div>
      <h3>Connected Accounts</h3>
      <ul>
        {addresses && addresses.map((addr) => {
          return <li key={addr}>Address: {addr}</li>
        })}
      </ul>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.investorReducer.addresses
});

export default connect(mapStateToProps, undefined)(DashboardPage);
