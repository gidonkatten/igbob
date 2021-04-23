import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';

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

  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const accessToken = await getAccessTokenSilently({
      scope: "issue:bonds",
    });

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);
    // const response = await fetch("https://igbob.herokuapp.com/apps/create-app", {
    const response = await fetch("http://localhost:5000/apps/create-app", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "totalIssuance": 1,
        "bondUnitName": "TB",
        "bondName": "TestBond",
        "issuerAddr": fromAddr,
        "startBuyDate": startBuyDate,
        "endBuyDate": endBuyDate,
        "maturityDate": maturityDate,
        "bondCost": bondCost,
        "bondCouponPaymentVal": 10,
        "bondCouponInstallments": 1,
        "bondPrincipal": bondPrincipal
      })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  return (
    <div>
      <h3>Issue Bond</h3>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Your Address:</p>
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
