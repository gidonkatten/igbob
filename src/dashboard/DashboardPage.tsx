import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { getAccountInformation } from '../algorand/balance/Balance';

interface DashboardPageProps {
  selectedAddress: string
}

function DashboardPage(props: DashboardPageProps) {

  const [algoBalance, setAlgoBalance] = useState<number>(0);
  const [stablecoinBalance, setStablecoinBalance] = useState<number>(0);

  const { selectedAddress } = props;
  const { getAccessTokenSilently } = useAuth0();

  // every 5 seconds update state
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedAddress) getAccountInformation(selectedAddress, setAlgoBalance, setStablecoinBalance);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedAddress]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAddress) return;

    const accessToken = await getAccessTokenSilently({ scope: "issue:bonds" });

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);
    const response = await fetch("https://igbob.herokuapp.com/fund/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ "addr": selectedAddress })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  return (
    <div>
      <div>
        <h3>Selected Address</h3>
        <p>
          {selectedAddress !== undefined ? <>{selectedAddress}</> : <>No address selected</>}
        </p>
      </div>
      <div>
        <h3>Algo Balance</h3>
        <p>
          Current balance is {algoBalance} algos
        </p>
        <p>
          Can use TestNet algo &nbsp;
          <a
            href="https://bank.testnet.algorand.network"
            target="_blank"
            rel="noopener noreferrer"
          >
            dispenser
          </a>
          &nbsp; to add 10 algos for transaction and minimum balance fees.
        </p>
      </div>
      <div>
        <h3>Stablecoin Balance</h3>
        <p>
          Current balance is ${stablecoinBalance}
        </p>
        <form onSubmit={handleSubmit}>
          <p>
            Can use TestNet stablecoin dispenser to add $1000 for bond payments.
            You must ensure your selected address is opted into the stablecoin asset in order to receive it.
          </p>
          <p>
          <button type="submit" disabled={selectedAddress === undefined}>Fund</button></p>
        </form>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAddress: state.userReducer.selectedAddress
});

export default connect(mapStateToProps, undefined)(DashboardPage);
