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

  const handleBuy = async () => {
    if (!selectedAccount) return;
    // await buyBond(appId, selectedAddress, buyBondId, bondAmount, algoAmount);
  }

  const enterAppView = (appId) => {
    setInOverview(false);
    setApp(getApp(appId));
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
      {getOptedIntoBond(app.bond_id) ?
        <p>Opted into bond, balance: {getBondBalance(app.app_id)}</p> :
        <p>
          Not opted into bond
          <Button variant="primary" onClick={handleAssetOptIn}>Connect</Button>
        </p>
      }
      <div>
        <p>Name: {app.name}</p>
        <p>Description: {app.description}</p>
        <p>Start buy date: {app.start_buy_date}</p>
        <p>End buy date: {app.end_buy_date}</p>
        <p>Maturity date: {app.maturity_date}</p>
        <p>Bond cost: ${app.bond_cost.toFixed(6)}</p>
        <p>Bond coupon: ${app.bond_coupon.toFixed(6)}</p>
        <p>Bond principal: ${app.bond_principal.toFixed(6)}</p>
      </div>
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