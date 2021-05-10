import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Form from 'react-bootstrap/Form';
import { UserAccount } from '../redux/reducers/user';
import { selectedAccountSelector } from '../redux/selectors/selectors';
import { convertDateToUnixTime } from '../utils/Utils';

interface IssuerPageProps {
  selectedAccount: UserAccount
}

function IssuerPage(props: IssuerPageProps) {

  const [name, setName] = useState<string>('');
  const [des, setDes] = useState<string>('');
  const [totalIssuance, setTotalIssuance] = useState<number>(0);
  const [bondLength, setBondLength] = useState<number>(0);
  const [period, setPeriod] = useState<number>(0);
  const [startBuyDate, setStartBuyDate] = useState<string>('');
  const [endBuyDate, setEndBuyDate] = useState<string>('');
  const [bondCost, setBondCost] = useState<number>(0);
  const [bondCoupon, setBondCoupon] = useState<number>(0);
  const [bondPrincipal, setBondPrincipal] = useState<number>(0);

  const { selectedAccount } = props;
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
        "name": name,
        "description": des,
        "bondUnitName": "TB",
        "bondName": "TestBond",
        "totalIssuance": totalIssuance,
        "issuerAddr": selectedAccount.address,
        "bondLength": bondLength,
        "period": period,
        "startBuyDate": convertDateToUnixTime(startBuyDate),
        "endBuyDate": convertDateToUnixTime(endBuyDate),
        "bondCost": bondCost,
        "bondCoupon": bondCoupon,
        "bondPrincipal": bondPrincipal
      })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  return (
    <div className={"page-content"}>
      <h3>Issue Bond</h3>

      <Form onSubmit={handleSubmit}>

        <Form.Group>
          <Form.Label>Name:</Form.Label>
            <Form.Control
              value={name}
              onChange={e => setName(e.target.value)}
              type="input"
              name="name"
              required
              maxLength={63}
            />
          <Form.Text muted>This is what investors will see</Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Description:</Form.Label>
          <Form.Control
            value={des}
            onChange={e => setDes(e.target.value)}
            as="textarea"
            rows={3}
            name="des"
            required
            maxLength={511}
          />
          <Form.Text muted>This is what investors will see</Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Selected Address:</Form.Label>
          <Form.Text>
            {selectedAccount ? <>{selectedAccount.address}</> : <>No address selected</>}
          </Form.Text>
          <Form.Text muted>This is where the bond proceeds will go - can be changed in settings</Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Number of Bonds:</Form.Label>
          <Form.Control
              value={totalIssuance}
              onChange={e => setTotalIssuance(parseInt(e.target.value))}
              type="number"
              name="totalIssuance"
              required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Bond Length:</Form.Label>
          <Form.Control
            value={bondLength}
            onChange={e => setBondLength(parseInt(e.target.value))}
            type="number"
            name="bondLength"
            required
          />
          <Form.Label>Bond Period:</Form.Label>
          <Form.Control
            value={period}
            onChange={e => setPeriod(parseInt(e.target.value))}
            type="number"
            name="period"
            required
          />
          <Form.Text muted>{bondLength} coupon payments, payable every {period} seconds</Form.Text>
        </Form.Group>

        <Form.Group>
          <Form.Label>Start buy date:</Form.Label>
          <Form.Control
            value={startBuyDate}
            onChange={e => setStartBuyDate(e.target.value)}
            type="datetime-local"
            name="startDate"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>End buy date:</Form.Label>
          <Form.Control
            value={endBuyDate}
            onChange={e => setEndBuyDate(e.target.value)}
            type="datetime-local"
            name="endDate"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Bond Cost:</Form.Label>
          <Form.Control
            value={bondCost}
            onChange={e => setBondCost(parseInt(e.target.value))}
            type="number"
            name="bondCost"
            required
            // placeholder="Micro Algos"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Bond Coupon:</Form.Label>
          <Form.Control
            value={bondCoupon}
            onChange={e => setBondCoupon(parseInt(e.target.value))}
            type="number"
            name="bondCoupon"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Bond Principal:</Form.Label>
          <Form.Control
            value={bondPrincipal}
            onChange={e => setBondPrincipal(parseInt(e.target.value))}
            type="number"
            name="bondPrincipal"
            required
            // placeholder="Micro Algos"
          />
        </Form.Group>

        <Button
          variant="contained"
          color="primary"
          type="submit"
        >
          Create
        </Button>
      </Form>
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
});

export default connect(mapStateToProps, undefined)(IssuerPage);
