import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import { selectedAccountSelector } from '../redux/selectors/userSelector';
import { convertDateToUnixTime } from '../utils/Utils';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import * as algosdk from 'algosdk';
import { AlgoNumberInput, StableCoinInputNoDecimal } from '../common/NumberInput';
import { UserAccount } from '../redux/types';
import { NotificationManager } from 'react-notifications';

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
  const [financialRegulatorAddr, setFinancialRegulatorAddr] = useState<string>('');

  const { selectedAccount } = props;
  const { getAccessTokenSilently } = useAuth0();

  const isGreenVerifierAddrValid = greenVerifierAddr ? algosdk.isValidAddress(greenVerifierAddr) : true;
  const isFinancialRegulatorAddrValid = greenVerifierAddr ? algosdk.isValidAddress(financialRegulatorAddr) : true;

  const clearForm = () => {
    setName('');
    setDes('');
    setTotalIssuance(0);
    setNumCouponPayments(0);
    setStartBuyDate(null);
    setEndBuyDate(null);
    setMaturityDate(null);
    setBondCost(0);
    setBondCoupon(0);
    setBondPrincipal(0);
    setGreenVerifierAddr('');
    setFinancialRegulatorAddr('');
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedAccount ||
      !startBuyDate ||
      !endBuyDate ||
      numCouponPayments === undefined ||
      !isGreenVerifierAddrValid ||
      !isFinancialRegulatorAddrValid
    ) return;

    const accessToken = await getAccessTokenSilently();

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);

    const sbd = convertDateToUnixTime(startBuyDate!);
    const ebd = convertDateToUnixTime(endBuyDate!);
    const md = convertDateToUnixTime(maturityDate!);
    const period = numCouponPayments === 0 ? (md - ebd) : Math.round((md - ebd) / numCouponPayments);

    const response = await fetch("https://blockchain-bonds-server.herokuapp.com/apps/create-app", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "name": name,
        "description": des,
        "bondUnitName": "TB",
        "bondName": "TestBond",
        "totalIssuance": totalIssuance * 1e6,
        "issuerAddr": selectedAccount.address,
        "greenVerifierAddr": greenVerifierAddr,
        "financialRegulatorAddr": financialRegulatorAddr,
        "bondLength": numCouponPayments,
        "period": period,
        "startBuyDate": sbd,
        "endBuyDate": ebd,
        "bondCost": bondCost, // Per .000001 bond
        "bondCoupon": bondCoupon, // Per .000001 bond
        "bondPrincipal": bondPrincipal, // Per .000001 bond
      })
    });

    const status = response.status;
    if (!(status >= 200 && status < 300)) {
      NotificationManager.error(await response.text(), 'Failed To Issue Bond');
    } else {
      clearForm();
      NotificationManager.info('This will take a few minutes...', 'Creating Bond');
    }
  }

  const handleStartDateChange = (date) => setStartBuyDate(date);
  const handleEndDateChange = (date) => setEndBuyDate(date)
  const handleMaturityDateChange = (date) => setMaturityDate(date)

  return (
    <form onSubmit={handleSubmit}>

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

      <TextField
        label="Issuer Address:"
        value={selectedAccount ? selectedAccount.address : ''}
        required
        fullWidth
        InputProps={{ readOnly: true }}
        helperText="This is where the bond proceeds will go - can be changed in settings"
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      <TextField
        error={!isGreenVerifierAddrValid}
        label="Green Verifier Address:"
        value={greenVerifierAddr}
        onChange={e => setGreenVerifierAddr(e.target.value)}
        required
        fullWidth
        helperText={!isGreenVerifierAddrValid ? "Invalid address" : undefined}
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      <TextField
        error={!isFinancialRegulatorAddrValid}
        label="Financial regulator Address:"
        value={financialRegulatorAddr}
        onChange={e => setFinancialRegulatorAddr(e.target.value)}
        required
        fullWidth
        helperText={!isFinancialRegulatorAddrValid ? "Invalid address" : undefined}
        InputLabelProps={{ required: false }}
        style={{ margin: '8px 0px' }}
      />

      {/*Row split into halves*/}
      <div style={{ margin: '8px 0px', width: '100%' }}>
        <FormControl style={{ width: '50%', paddingRight: '4px' }}>
          <TextField
            label="No. of Bonds To Mint:"
            value={totalIssuance}
            onChange={e => setTotalIssuance(Number(e.target.value))}
            required
            fullWidth
            InputLabelProps={{ required: false }}
            InputProps={{ inputComponent: AlgoNumberInput }}
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
          value={bondCost}
          onChange={e => setBondCost(parseInt(e.target.value))}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StableCoinInputNoDecimal }}
          style={{ width: '33.33%', paddingRight: '4px' }}
        />

        <TextField
          label="Bond Coupon:"
          value={numCouponPayments === 0 ? 0 : bondCoupon}
          onChange={e => setBondCoupon(parseInt(e.target.value))}
          disabled={numCouponPayments === 0}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StableCoinInputNoDecimal }}
          style={{ width: '33.33%', paddingRight: '4px', paddingLeft: '4px' }}
        />

        <TextField
          label="Bond Principal:"
          value={bondPrincipal}
          onChange={e => setBondPrincipal(parseInt(e.target.value))}
          required
          InputLabelProps={{ required: false }}
          InputProps={{ inputComponent: StableCoinInputNoDecimal }}
          style={{ width: '33.33%', paddingLeft: '4px' }}
        />

      </div>

      <Button
        variant="contained"
        color="primary"
        type="submit"
        style={{ margin: '8px 0px' }}
        fullWidth
      >
        Create
      </Button>
    </form>
  )
}


const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
});

const mapDispatchToProps = {}

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(IssueBondForm);
