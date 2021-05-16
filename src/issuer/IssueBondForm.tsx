import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Form from 'react-bootstrap/Form';
import { UserAccount } from '../redux/reducers/userReducer';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { convertDateToUnixTime } from '../utils/Utils';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import * as algosdk from 'algosdk';
import { StablecoinInput } from '../common/StablecoinInput';

interface StateProps {
  selectedAccount?: UserAccount;
}

interface DispatchProps {}

interface OwnProps {}

type IssueBondFormProps = StateProps & DispatchProps & OwnProps;

function IssueBondForm(props: IssueBondFormProps) {

  const [name, setName] = useState<string>('');
  const [des, setDes] = useState<string>('');
  const [totalIssuance, setTotalIssuance] = useState<number>(0);
  const [numCouponPayments, setNumCouponPayments] = useState<number>(0);
  const [startBuyDate, setStartBuyDate] = useState(null);
  const [endBuyDate, setEndBuyDate] = useState(null);
  const [maturityDate, setMaturityDate] = useState(null);
  const [bondCost, setBondCost] = useState<number>(0);
  const [bondCoupon, setBondCoupon] = useState<number>(0);
  const [bondPrincipal, setBondPrincipal] = useState<number>(0);
  const [greenVerifierAddr, setGreenVerifierAddr] = useState<string>('');

  const { selectedAccount } = props;
  const { getAccessTokenSilently } = useAuth0();

  const isValidAddr = greenVerifierAddr ? algosdk.isValidAddress(greenVerifierAddr) : true;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAccount || !startBuyDate || !endBuyDate || numCouponPayments === undefined || !isValidAddr) return;

    const accessToken = await getAccessTokenSilently();

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);

    const sbd = convertDateToUnixTime(startBuyDate!);
    const ebd = convertDateToUnixTime(endBuyDate!);
    const md = convertDateToUnixTime(maturityDate!);
    const period = numCouponPayments === 0 ? (md - ebd) : ((md - ebd) / numCouponPayments);

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
        "greenVerifierAddr": greenVerifierAddr,
        "bondLength": numCouponPayments,
        "period": period,
        "startBuyDate": sbd,
        "endBuyDate": ebd,
        "bondCost": bondCost * 1000000,
        "bondCoupon": bondCoupon * 1000000,
        "bondPrincipal": bondPrincipal * 1000000
      })
    });

    const parseResponse = await response.text();
    console.log(parseResponse);
  }

  const handleStartDateChange = (date) => setStartBuyDate(date);
  const handleEndDateChange = (date) => setEndBuyDate(date)
  const handleMaturityDateChange = (date) => setMaturityDate(date)

  return (
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
        label="Issuer Address:"
        defaultValue={selectedAccount ? selectedAccount.address : undefined}
        required
        fullWidth
        InputProps={{ readOnly: true }}
        helperText="This is where the bond proceeds will go - can be changed in settings"
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      <TextField
        error={!isValidAddr}
        label="Green Verifier Address:"
        value={greenVerifierAddr}
        onChange={e => setGreenVerifierAddr(e.target.value)}
        required
        fullWidth
        helperText={!isValidAddr ? "Invalid address" : undefined}
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      {/*Row split into halves*/}
      <div style={{ margin: '8px 0px', width: '100%' }}>
        <FormControl style={{ width: '50%', paddingRight: '4px' }}>
          <InputLabel>No. of Bonds To Mint:</InputLabel>
          <Input
            value={totalIssuance}
            onChange={e => setTotalIssuance(parseInt(e.target.value))}
            type="number"
            name="totalIssuance"
            required
            inputProps={{ min: 0 }}
          />
        </FormControl>

        <FormControl style={{ width: '50%', paddingLeft: '4px' }}>
          <InputLabel>No. of Coupon Payments:</InputLabel>
          <Input
            value={numCouponPayments}
            onChange={e => setNumCouponPayments(parseInt(e.target.value))}
            type="number"
            name="numCouponPayments"
            required
            inputProps={{ min: 0, max: 63 }}
          />
        </FormControl>
      </div>

      {/*Row split into quarters*/}
      <div style={{ margin: '8px 0px', width: '100%' }}>
        <KeyboardDateTimePicker
          clearable
          label="Start buy date:"
          value={startBuyDate}
          onChange={handleStartDateChange}
          disablePast
          format="yyyy/MM/dd HH:mm"
          required
          style={{ width: '33.33%', paddingRight: '4px' }}
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
          style={{ width: '33.33%', paddingLeft: '4px', paddingRight: '4px' }}
          InputLabelProps={{ required: false }}
        />

        <KeyboardDateTimePicker
          clearable
          label="Maturity date:"
          value={maturityDate}
          onChange={handleMaturityDateChange}
          disablePast
          format="yyyy/MM/dd HH:mm"
          required
          style={{ width: '33.33%', paddingLeft: '4px' }}
          InputLabelProps={{ required: false }}
        />
      </div>

      {/*Row split into thirds*/}
      <div style={{ margin: '8px 0px', width: '100%' }}>

        <TextField
          label="Bond Cost:"
          value={bondCost.toFixed(6)}
          onChange={e => setBondCost(Number(e.target.value))}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StablecoinInput }}
          style={{ width: '33.33%', paddingRight: '4px' }}
        />

        <TextField
          label="Bond Coupon:"
          value={numCouponPayments === 0 ? 0 : bondCoupon.toFixed(6)}
          onChange={e => setBondCoupon(Number(e.target.value))}
          disabled={numCouponPayments === 0}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StablecoinInput }}
          style={{ width: '33.33%', paddingRight: '4px', paddingLeft: '4px' }}
        />

        <TextField
          label="Bond Principal:"
          value={bondPrincipal.toFixed(6)}
          onChange={e => setBondPrincipal(Number(e.target.value))}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StablecoinInput }}
          style={{ width: '33.33%', paddingLeft: '4px' }}
        />

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
  )
}


const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssueBondForm);
