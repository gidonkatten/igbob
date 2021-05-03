import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';

interface IssuerPageProps {
  selectedAddress: string
}

function IssuerPage(props: IssuerPageProps) {

  const [totalIssuance, setTotalIssuance] = useState<number>(0);
  const [bondCost, setBondCost] = useState<number>(0);
  const [bondCoupon, setBondCoupon] = useState<number>(0);
  const [bondPrincipal, setBondPrincipal] = useState<number>(0);
  const [startBuyDate, setStartBuyDate] = useState<string>('');
  const [endBuyDate, setEndBuyDate] = useState<string>('');
  const [bondLength, setBondLength] = useState<string>('');

  const { selectedAddress } = props;
  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const accessToken = await getAccessTokenSilently({ scope: "issue:bonds" });

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);
    const response = await fetch("https://igbob.herokuapp.com/apps/create-app", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "totalIssuance": totalIssuance,
        "bondUnitName": "TB",
        "bondName": "TestBond",
        "issuerAddr": selectedAddress,
        "bondLength": bondLength,
        "startBuyDate": startBuyDate,
        "endBuyDate": endBuyDate,
        "bondCost": bondCost,
        "bondCoupon": bondCoupon,
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
          <p>Selected Address (this is where the proceeds will go):</p>
          <p>
            {selectedAddress !== undefined ? <>{selectedAddress}</> : <>No address selected</>}
          </p>
        </label>
        <label>
          <p>Number of Bonds:</p>
          <input
            value={totalIssuance}
            onChange={e => setTotalIssuance(parseInt(e.target.value))}
            type="number"
            name="totalIssuance"
            required
          />
        </label>
        <label>
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
          <p>Bond Coupon (payed every 6 months for duration of bond):</p>
          <input
            value={bondCoupon}
            onChange={e => setBondCoupon(parseInt(e.target.value))}
            type="number"
            name="bondCoupon"
            required
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
          <p>Bond Length (number of 6 month periods):</p>
          <input
            value={bondLength}
            onChange={e => setBondLength(e.target.value)}
            type="number"
            name="bondLength"
            required
          />
        </label>
        <p><button type="submit">Create</button></p>
      </form>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  addresses: state.userReducer.addresses,
  selectedAddress: state.userReducer.selectedAddress
});

export default connect(mapStateToProps, undefined)(IssuerPage);
