import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Form from 'react-bootstrap/Form';
import { UserAccount } from '../redux/reducers/user';
import { selectedAccountSelector } from '../redux/selectors/selectors';
import { convertDateToUnixTime } from '../utils/Utils';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import { KeyboardDateTimePicker } from "@material-ui/pickers";

interface IssuerPageProps {
  selectedAccount: UserAccount
}

function IssuerPage(props: IssuerPageProps) {

  const [name, setName] = useState<string>('');
  const [des, setDes] = useState<string>('');
  const [totalIssuance, setTotalIssuance] = useState<number>();
  const [bondLength, setBondLength] = useState<number>();
  const [period, setPeriod] = useState<number>();
  const [startBuyDate, setStartBuyDate] = useState(null);
  const [endBuyDate, setEndBuyDate] = useState(null);
  const [bondCost, setBondCost] = useState<number>();
  const [bondCoupon, setBondCoupon] = useState<number>();
  const [bondPrincipal, setBondPrincipal] = useState<number>();

  const { selectedAccount } = props;
  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAccount || !startBuyDate || !endBuyDate) return;

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
        "startBuyDate": convertDateToUnixTime(startBuyDate!),
        "endBuyDate": convertDateToUnixTime(endBuyDate!),
        "bondCost": bondCost,
        "bondCoupon": bondCoupon,
        "bondPrincipal": bondPrincipal
      })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  const handleStartDateChange = (date) => setStartBuyDate(date);
  const handleEndDateChange = (date) => setEndBuyDate(date)

  return (
    <div className={"page-content"}>
      <h3>Issue Bond</h3>

      <Form onSubmit={handleSubmit}>

        <TextField
          label="Name:"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          fullWidth
          helperText="This is what the investor will see"
          inputProps={{ maxLength: 63 }}
          InputLabelProps={{ required: false }}
          style={{ margin: '8px 0px' }}
        />

        <TextField
          label="Description:"
          value={des}
          onChange={e => setDes(e.target.value)}
          required
          fullWidth
          multiline
          helperText="This is what the investor will see"
          inputProps={{ maxLength: 511 }}
          InputLabelProps={{ required: false }}
          style={{ margin: '8px 0px' }}
        />

        {/*TODO: investigate why doesn't set when undefined -> addr*/}
        <TextField
          label="Selected Address:"
          defaultValue={selectedAccount ? selectedAccount.address : undefined}
          required
          fullWidth
          InputProps={{ readOnly: true }}
          helperText="This is where the bond proceeds will go - can be changed in settings"
          InputLabelProps={{ required: false }}
          style={{ margin: '8px 0px' }}
        />

        <FormControl style={{ margin: '8px 0px', width: '100%' }}>
          <InputLabel>Number Of Bonds To Mint:</InputLabel>
          <Input
            value={totalIssuance}
            onChange={e => setTotalIssuance(parseInt(e.target.value))}
            type="number"
            name="totalIssuance"
            required
          />
        </FormControl>

        {/*Row split into halves*/}
        <div style={{ margin: '8px 0px', width: '100%' }}>
          <FormControl style={{ width: '50%', paddingRight: '4px' }}>
            <InputLabel>Bond Length:</InputLabel>
            <Input
              value={bondLength}
              onChange={e => setBondLength(parseInt(e.target.value))}
              type="number"
              name="bondLength"
              required
            />
          </FormControl>

          <FormControl style={{ width: '50%', paddingLeft: '4px' }}>
            <InputLabel>Bond Period:</InputLabel>
            <Input
              value={period}
              onChange={e => setPeriod(parseInt(e.target.value))}
              type="number"
              name="period"
              required
            />
          </FormControl>
        </div>

        <Form.Text
          muted
          style={{ margin: '8px 0px' }}
        >
          {bondLength} coupon payments, payable every {period} seconds
        </Form.Text>

        {/*Row split into halves*/}
        <div style={{ margin: '8px 0px', width: '100%' }}>
          <KeyboardDateTimePicker
            clearable
            label="Start buy date:"
            value={startBuyDate}
            onChange={handleStartDateChange}
            disablePast
            format="yyyy/MM/dd HH:mm"
            required
            style={{ width: '50%', paddingRight: '4px' }}
            InputLabelProps={{ required: false }}
          />

          <KeyboardDateTimePicker
            clearable
            label="End buy date:"
            value={endBuyDate}
            onChange={handleEndDateChange}
            disablePast
            format="yyyy/MM/dd HH:mm"
            required
            style={{ width: '50%', paddingLeft: '4px' }}
            InputLabelProps={{ required: false }}
          />
        </div>

        {/*Row split into thirds*/}
        <div style={{ margin: '8px 0px', width: '100%' }}>

          <FormControl style={{ width: '33.33%', paddingRight: '4px' }}>
            <InputLabel>Bond Cost:</InputLabel>
            <Input
              value={bondCost}
              onChange={e => setBondCost(parseInt(e.target.value))}
              type="number"
              name="bondCost"
              required
            />
          </FormControl>

          <FormControl style={{ width: '33.33%', paddingRight: '4px', paddingLeft: '4px' }}>
            <InputLabel>Bond Coupon:</InputLabel>
            <Input
              value={bondCoupon}
              onChange={e => setBondCoupon(parseInt(e.target.value))}
              type="number"
              name="bondCoupon"
              required
            />
          </FormControl>

          <FormControl style={{ width: '33.33%', paddingLeft: '4px' }}>
            <InputLabel>Bond Principal:</InputLabel>
            <Input
              value={bondPrincipal}
              onChange={e => setBondPrincipal(parseInt(e.target.value))}
              type="number"
              name="bondPrincipal"
              required
            />
          </FormControl>
        </div>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ margin: '8px 0px' }}
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
