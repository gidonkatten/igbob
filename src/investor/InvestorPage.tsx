import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/buy/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps, setSelectedAccount } from '../redux/actions/actions';
import { App } from '../redux/reducers/bond';
import {
  appsSelector, getAppSelector,
  getBondBalanceSelector,
  getOptedIntoBondSelector,
  selectedAccountSelector
} from '../redux/selectors/selectors';
import { getAccountInformation } from '../algorand/balance/Balance';
import Button from 'react-bootstrap/Button';
import { UserAccount } from '../redux/reducers/user';
import Form from 'react-bootstrap/Form';
import { formatStablecoin } from '../utils/Utils';

interface InvestorPageProps {
  selectedAccount?: UserAccount;
  getOptedIntoBond: (bondId: number) => boolean;
  getBondBalance: (bondId: number) => number;
  apps: Map<number, App>;
  getApp: (appId: number) => App | undefined;
  setSelectedAccount: typeof setSelectedAccount;
  setApps: typeof setApps;
}

function InvestorPage(props: InvestorPageProps) {

  const [inOverview, setInOverview] = useState<boolean>(true);
  const [app, setApp] = useState<App>();
  const [noOfBonds, setNoOfBonds] = useState<number>(0);

  const {
    selectedAccount,
    getOptedIntoBond,
    getBondBalance,
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

  const handleAssetOptIn = async () => {
    if (!selectedAccount || !app) return;
    await optIntoAsset(app.bond_id, selectedAccount.address)
    const userAccount = await getAccountInformation(selectedAccount.address);
    setSelectedAccount(userAccount);
  }

  const currentTime: number = Date.now() / 1000;
  const inBuyWindow = app && (currentTime > app!.start_buy_date) && (currentTime < app!.end_buy_date)

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
      noOfBonds,
      app.bond_cost
    );
    const userAccount = await getAccountInformation(selectedAccount.address);
    setSelectedAccount(userAccount);
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    const newApp = getApp(appId);
    setApp(newApp);
    // const application = await algodClient.getApplicationByID(appId).do();
    // console.log(application);
  }

  const exitAppView = () => {
    setInOverview(true);
    setApp(undefined);
  }

  const appsList = (
    <div>
      {apps && [...apps].map(([appId, app]) => {
        return (
          <div
            onClick={() => enterAppView(appId)}
            key={appId}
          >
            {appId} {app.name}
          </div>
        )
      })}
    </div>
  )

  const appView = app && (
    <div>

      <div onClick={() => exitAppView()}>
        Go Back
      </div>

      <div>
        <p>Name: {app.name}</p>
        <p>Description: {app.description}</p>
        <p>Start buy date: {app.start_buy_date}</p>
        <p>End buy date: {app.end_buy_date}</p>
        <p>Maturity date: {app.maturity_date}</p>
        <p>Bond cost: ${formatStablecoin(app.bond_cost)}</p>
        <p>Bond coupon: ${formatStablecoin(app.bond_coupon)}</p>
        <p>Bond principal: ${formatStablecoin(app.bond_principal)}</p>
      </div>

      {getOptedIntoBond(app.bond_id) ?
        <p>Opted into bond, balance: {getBondBalance(app.bond_id)}</p> :
        <p>
          Not opted into bond
          <Button variant="primary" onClick={handleAssetOptIn}>Opt In</Button>
        </p>
      }

      {inBuyWindow ?
        <Form onSubmit={handleBuy}>
          <Form.Group>
            <Form.Label>Number of bonds to buy:</Form.Label>
            <Form.Control
              value={noOfBonds}
              onChange={e => setNoOfBonds(parseInt(e.target.value))}
              type="number"
              name="noOfBonds"
              required
            />
            <Form.Text muted>This will cost ${formatStablecoin(noOfBonds * app.bond_cost)}</Form.Text>
            <Button variant="primary" type="submit">Buy</Button>
          </Form.Group>
        </Form> :
        <p>Not in buy window</p>
      }

    </div>
  )

  return (
    <div>
      {inOverview ? appsList : appView}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAccount: selectedAccountSelector(state),
  getOptedIntoBond: getOptedIntoBondSelector(state),
  getBondBalance: getBondBalanceSelector(state),
  apps: appsSelector(state),
  getApp: getAppSelector(state),
});

const mapDispatchToProps = {
  setSelectedAccount,
  setApps
};

export default connect(mapStateToProps, mapDispatchToProps)(InvestorPage);