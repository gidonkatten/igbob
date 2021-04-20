import React, { useState } from 'react';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { createAsset } from '../algorand/assets/CreateAsset';
import { createStatefulContract, StateStorage } from '../algorand/contracts/CreateStatefulContract';
import { convertDateToUnixTime } from '../utils/Utils';
import { connect } from 'react-redux';
import { algodClient } from '../algorand/utils/Utils';
import { issueBond } from '../algorand/issue/IssueBond';

interface IssuerPageProps {
  addresses: string[];
}

function IssuerPage(props: IssuerPageProps) {

  const [fromAddr, setFromAddr] = useState<string>('');
  const [bondCost, setBondCost] = useState<number>(0);
  const [bondPrincipal, setBondPrincipal] = useState<number>(0);
  const [startBuyDate, setStartBuyDate] = useState<string>('');
  const [endBuyDate, setEndBuyDate] = useState<string>('');
  const [maturityDate, setMaturityDate] = useState<string>('');

  const { addresses } = props;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await issueBond(1, "TB", "TestBond", fromAddr, startBuyDate, endBuyDate,
      maturityDate, bondCost, 10, 1, 100);
  }

  return (
    <div>
      <h3>Issue Bond</h3>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Bond Cost:</p>
          <select onChange={e => setFromAddr(e.target.value)}>
            <option value="">Get accounts first</option>
            {addresses.map((addr) => {
              return <option key={addr} value={addr}>{addr}</option>
            })}
          </select>
        </label>   <label>
          <p>Bond Cost:</p>
          <input
            value={bondCost}
            onChange={e => setBondCost(parseInt(e.target.value))}
            type="number"
            name="bondCost"
            required
            // placeholder="Micro Algos"
          />
        </label>
        <label>
          <p>Bond Principal:</p>
          <input
            value={bondPrincipal}
            onChange={e => setBondPrincipal(parseInt(e.target.value))}
            type="number"
            name="bondPrincipal"
            required
            // placeholder="Micro Algos"
          />
        </label>
        <label>
          <p>Start buy date:</p>
          <input
            value={startBuyDate}
            onChange={e => setStartBuyDate(e.target.value)}
            type="datetime-local"
            name="startDate"
            required
          />
        </label>
        <label>
          <p>End buy date:</p>
          <input
            value={endBuyDate}
            onChange={e => setEndBuyDate(e.target.value)}
            type="datetime-local"
            name="endDate"
            required
          />
        </label>
        <label>
          <p>Maturity date:</p>
          <input
            value={maturityDate}
            onChange={e => setMaturityDate(e.target.value)}
            type="datetime-local"
            name="endDate"
            required
          />
        </label>
        <p><button type="submit">Create</button></p>
      </form>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.investorReducer.addresses
});

export default connect(mapStateToProps, undefined)(IssuerPage);
