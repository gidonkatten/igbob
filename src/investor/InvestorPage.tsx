import React, { useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/buy/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';

interface InvestorPageProps {
  addresses: string[];
}

function InvestorPage(props: InvestorPageProps) {
  const [optInBondId, setOptInBondId] = useState<number>(0);
  const [appId, setAppId] = useState<number>(0);
  const [buyBondId, setBuyBondId] = useState<number>(0);
  const [bondAmount, setBondAmount] = useState<number>(0);
  const [algoAmount, setAlgoAmount] = useState<number>(0);

  const { addresses } = props;

  const handleAssetOptIn = async (e: any) => {
    e.preventDefault();
    if (optInBondId === undefined) return;
    if (addresses.length > 0) {
      await optIntoAsset(optInBondId, addresses[0])
    } else {
      console.error("No Accounts Connected");
    }
  }

  const handleBuy = async (e: any) => {
    e.preventDefault();
    if (appId === undefined || buyBondId === undefined || bondAmount === undefined || algoAmount === undefined) return;
    if (addresses.length > 0) {
      await buyBond(appId, addresses[0], buyBondId, bondAmount, algoAmount);
    } else {
      console.error("No Accounts Connected");
    }
  }

  return (
    <div>
      <h3>Must Opt In Before Receiving Bond</h3>
      <form onSubmit={handleAssetOptIn}>
        <label>
          <p>Opt Into Asset:</p>
          <input
            value={optInBondId}
            onChange={e => setOptInBondId(parseInt(e.target.value))}
            type="number"
            name="bondCost"
            required
            // placeholder="Asset ID"
          />
        </label>
        <p><button type="submit">Opt In</button></p>
      </form>
      <h3>Buy Bond</h3>
      <form onSubmit={handleBuy}>
        <label>
          <p>App Id:</p>
          <input
            value={appId}
            onChange={e => setAppId(parseInt(e.target.value))}
            type="number"
            name="appId"
            required
            // placeholder="App ID"
          />
        </label>
        <label>
          <p>BondId:</p>
          <input
            value={buyBondId}
            onChange={e => setBuyBondId(parseInt(e.target.value))}
            type="number"
            name="buyBondId"
            required
            // placeholder="Bond ID"
          />
        </label>
        <label>
          <p>Algo Amount:</p>
          <input
            value={algoAmount}
            onChange={e => setAlgoAmount(parseInt(e.target.value))}
            type="number"
            name="algoAmount"
            required
            // placeholder="Micro Algos"
          />
        </label>
        <label>
          <p>Number of Bonds:</p>
          <input
            value={bondAmount}
            onChange={e => setBondAmount(parseInt(e.target.value))}
            type="number"
            name="bondAmount"
            required
            // placeholder="Number of Bonds"
          />
        </label>
        <p><button type="submit">Buy</button></p>
      </form>
      <h3>Sell Bond</h3>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.userReducer.addresses
});

export default connect(mapStateToProps, undefined)(InvestorPage);