import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/bond/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps, setSelectedAccount } from '../redux/actions/actions';
import { App } from '../redux/reducers/bond';
import {
  appsSelector, getAppSelector,
  getBondBalanceSelector, getCouponRoundsCollSelector, getOptedIntoAppSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/selectors';
import { getAccountInformation, getAssetBalance, getStablecoinBalance } from '../algorand/balance/Balance';
import Button from '@material-ui/core/Button';
import { UserAccount } from '../redux/reducers/user';
import Form from 'react-bootstrap/Form';
import { formatStablecoin } from '../utils/Utils';
import { claimCoupon } from '../algorand/bond/Coupon';
import { claimPrincipal } from '../algorand/bond/Principal';
import BondTimeline from './BondTimeline';
import { indexerClient } from '../algorand/utils/Utils';
import { claimDefault } from '../algorand/bond/Default';
import { getHasDefaulted } from './Utils';
import { optIntoApp } from '../algorand/bond/OptIntoApp';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';

interface InvestorPageProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number;
  getOptedIntoApp: (appId: number) => boolean;
  getCouponRoundsColl: (appId: number) => number;
  apps: Map<number, App>;
  getApp: (appId: number) => App | undefined;
  setSelectedAccount: typeof setSelectedAccount;
  setApps: typeof setApps;
}

function InvestorPage(props: InvestorPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [noOfBondsToBuy, setNoOfBondsToBuy] = useState<number>(0);

  // Blockchain readings
  const [bondsMinted, setBondsMinted] = useState<number>(0);
  const [bondEscrowBalance, setBondEscrowBalance] = useState<number>(0);
  const [stablecoinEscrowBalance, setStablecoinEscrowBalance] = useState<number>(0);
  const [hasDefaulted, setHasDefaulted] = useState<boolean>(false);

  const {
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
    getOptedIntoApp,
    getCouponRoundsColl,
    apps,
    getApp,
    setSelectedAccount,
    setApps
  } = props;
  const { getAccessTokenSilently } = useAuth0();

  async function fetchApps() {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch("https://igbob.herokuapp.com/apps/all-apps", {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      const parseResponse = await response.json();
      setApps(parseResponse);
    } catch (err) {
      console.error(err.message);
    }
  }

  // fetch apps after initial render
  useEffect( () => {
    fetchApps();
  }, []);

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app.start_buy_date) && (currentTime < app.end_buy_date);
  const afterBuyWindow = app && (currentTime > app.end_buy_date);
  const afterMaturity = app && (currentTime > app.maturity_date);

  const bondBalance: number = app ? getBondBalance(app.bond_id) : 0;

  const handleAssetOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoAsset(app.bond_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  const handleAppOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoApp(app.app_id, selectedAccount.address);

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
  }

  const handleBuy = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;
    await buyBond(
      selectedAccount.address,
      app.app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      noOfBondsToBuy,
      app.bond_cost
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  const handleClaimCoupon = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;
    await claimCoupon(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.bond_id,
      app.bond_escrow_address,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      app.bond_coupon
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    )
  }

  const handleClaimPrincipal = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;
    await claimPrincipal(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      app.bond_principal
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  const handleClaimDefault = async (e: any) => {
    e.preventDefault();
    if (!selectedAccount || !app) return;

    await claimDefault(
      selectedAccount.address,
      app.app_id,
      app.manage_app_id,
      app.issuer_address,
      app.bond_id,
      app.bond_escrow_address,
      app.bond_escrow_program,
      app.stablecoin_escrow_address,
      app.stablecoin_escrow_program,
      bondBalance,
      (1 / (bondsMinted - bondEscrowBalance)) * stablecoinEscrowBalance
    );

    getAccountInformation(selectedAccount.address).then(acc => setSelectedAccount(acc));
    getAccountInformation(app.stablecoin_escrow_address).then(acc =>
      setStablecoinEscrowBalance(getStablecoinBalance(acc))
    );
    getAccountInformation(app.bond_escrow_address).then(acc =>
      setBondEscrowBalance(getAssetBalance(acc, app.bond_id))
    );
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
  }

  useEffect(() => {
    if (!app) return;

    Promise.all(
      [
        indexerClient.lookupAssetByID(app.bond_id).do(),
        getAccountInformation(app.bond_escrow_address),
        getAccountInformation(app.stablecoin_escrow_address)
      ]
    ).then(([asset, bondEscrow, stablecoinEscrow]) => {

      const bMinted = asset.asset.params.total;
      const bEscrowBalance = getAssetBalance(bondEscrow, app.bond_id);
      const sEscrowBalance = getStablecoinBalance(stablecoinEscrow);

      setBondsMinted(bMinted);
      setBondEscrowBalance(bEscrowBalance);
      setStablecoinEscrowBalance(sEscrowBalance);
      setHasDefaulted(getHasDefaulted(
        app.end_buy_date,
        app.maturity_date,
        app.period,
        app.bond_length,
        getCouponRoundsColl(app.app_id),
        app.bond_coupon,
        app.bond_principal,
        sEscrowBalance,
        bMinted - bEscrowBalance
      ));
    });
  }, [app])

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appsList = (
    <div>
      <h3>Listed Green Bonds</h3>
      <List component="nav">
        {apps && [...apps].map(([appId, app]) => {
          return (
            <ListItem
              button
              onClick={() => enterAppView(appId)}
              key={appId}
            >
              <ListItemText primary={app.name} secondary={"App Id: " + app.app_id}/>
            </ListItem>
          )
        })}
      </List>
    </div>

  )

  const appView = app && (
    <div>

      <ArrowBackIcon onClick={exitAppView}/>

      <BondTimeline
        startBuyDate={app.start_buy_date}
        endBuyDate={app.end_buy_date}
        bondLength={app.bond_length}
        maturityDate={app.maturity_date}
        period={app.period}
      />

      <div>
        <p>Name: {app.name}</p>
        <p>Description: {app.description}</p>
        <p>Start buy date: {app.start_buy_date}</p>
        <p>End buy date: {app.end_buy_date}</p>
        <p>Maturity date: {app.maturity_date}</p>
        <p>Bond cost: ${formatStablecoin(app.bond_cost)}</p>
        <p>Bond coupon: ${formatStablecoin(app.bond_coupon)}</p>
        <p>Number of coupon payments: {app.bond_length}</p>
        <p>Bond principal: ${formatStablecoin(app.bond_principal)}</p>
        <p>Bonds in circulation: {bondsMinted - bondEscrowBalance} / {bondsMinted}</p>
        <p>Stablecoin balance of bond escrow: ${formatStablecoin(stablecoinEscrowBalance)}</p>
      </div>

      <Form.Group>
        <Form.Label>Selected Address:</Form.Label>
        <Form.Text>
          {selectedAccount ? <>{selectedAccount.address}</> : <>No address selected</>}
        </Form.Text>
      </Form.Group>

      {getOptedIntoBond(app.bond_id) ?
        <p>Opted into bond, balance: {bondBalance}</p> :
        <p>
          Not opted into bond &nbsp;
          <Button variant="contained" color="primary" onClick={handleAssetOptIn}>Opt In</Button>
        </p>
      }

      {getOptedIntoApp(app.app_id) ?
        <p>Opted into app</p> :
        <p>
          Not opted into app &nbsp;
          <Button variant="contained" color="primary" onClick={handleAppOptIn}>Opt In</Button>
        </p>
      }

      {inBuyWindow ?
        <Form onSubmit={handleBuy}>
          <Form.Group>
            <Form.Label>Number of bonds to buy:</Form.Label>
            <Form.Control
              value={noOfBondsToBuy}
              onChange={e => setNoOfBondsToBuy(parseInt(e.target.value))}
              type="number"
              name="noOfBondsToBuy"
              required
            />
            <Form.Text muted>This will cost ${formatStablecoin(noOfBondsToBuy * app.bond_cost)}</Form.Text>
            <Button variant="contained" color="primary" type="submit">Buy</Button>
          </Form.Group>
        </Form> :
        <p>Not in buy window</p>
      }

      {afterBuyWindow ?
        <Form onSubmit={handleClaimCoupon}>
          <Form.Group>
            <Form.Label>Claim coupon</Form.Label>
            {/* TODO: Check if eligible */}
            <Form.Text muted>You have claimed {getCouponRoundsColl(app.app_id)} / {app.bond_length} coupons</Form.Text>
            <Form.Text muted>You are eligible to claim ${formatStablecoin(bondBalance * app.bond_coupon)}</Form.Text>
            <Button variant="contained" color="primary" type="submit">Claim Coupon</Button>
          </Form.Group>
        </Form> :
        <p>Ineligible to claim coupon at this time</p>
      }

      {afterMaturity ?
        <Form onSubmit={handleClaimPrincipal}>
          <Form.Group>
            <Form.Label>Claim principal</Form.Label>
            {/* TODO: Check if eligible */}
            <Form.Text muted>You are eligible to claim ${formatStablecoin(bondBalance * app.bond_principal)}</Form.Text>
            <Button variant="contained" color="primary" type="submit">Claim Principal</Button>
          </Form.Group>
        </Form> :
        <p>Ineligible to claim principal at this time</p>
      }

      {hasDefaulted ?
        <Form onSubmit={handleClaimDefault}>
          <Form.Group>
            <Form.Label>Claim default</Form.Label>
            <Form.Text muted>
              You are eligible to claim ${formatStablecoin((bondBalance / (bondsMinted - bondEscrowBalance)) * stablecoinEscrowBalance)}
            </Form.Text>
            <Button variant="contained" color="primary" type="submit">Claim Default</Button>
          </Form.Group>
        </Form> :
        <p>Ineligible to claim default as stablecoin escrow balance has enough funds</p>
      }

    </div>
  )

  return (
    <div className={"page-content"}>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  getOptedIntoApp: getOptedIntoAppSelector(state),
  getCouponRoundsColl: getCouponRoundsCollSelector(state),
  apps: appsSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setApps
};

export default connect(mapStateToProps, mapDispatchToProps)(InvestorPage);