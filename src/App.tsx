import React, { useEffect } from "react";
import { Route, Switch } from 'react-router-dom';
import IssuerPageContainer from "./issuer/IssuerPageContainer";
import InvestorPageContainer from './investor/InvestorPageContainer';
import GreenVerifierPageContainer from './greenVerifier/GreenVerifierPageContainer';
import FinancialRegulatorPageContainer from './financialRegulator/FinancialRegulatorPageContainer';
import HomePage from "./home/HomePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import SettingsPage from "./settings/SettingsPage";
import NavbarManager from "./navbar/NavbarManager";
import DashboardPage from "./dashboard/DashboardPage";
import { useAuth0 } from '@auth0/auth0-react';
import { setAccountAddresses, setSelectedAccount } from './redux/actions/actions';
import { connect } from 'react-redux';
import { getAccountInformation } from './algorand/account/Account';
import { IPFSAlgoWrapper } from './ipfs/IPFSAlgoWrapper';
import { NotificationContainer, NotificationManager } from 'react-notifications';

interface AppProps {
  setAccountAddresses: typeof setAccountAddresses;
  setSelectedAccount: typeof setSelectedAccount;
}

function App(props: AppProps) {

  const { setAccountAddresses, setSelectedAccount } = props;
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  async function fetchAddresses() {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch("https://blockchain-bonds-server.herokuapp.com/accounts/get-addresses", {
        headers: { Authorization: `Bearer ${accessToken}`},
      });


      const status = response.status;
      if (status >= 200 && status < 300) {
        // Set addresses array
        const { addresses } = await response.json();
        setAccountAddresses(addresses);

        // Set selected address
        if (!addresses[0]) {
          NotificationManager.info(
            'Go to the Settings page to connect to MyAlgo Wallet',
            'No Algorand Addresses Connected'
          );
        } else {
          const userAccount = await getAccountInformation(addresses[0]);
          setSelectedAccount(userAccount);
          NotificationManager.info(addresses[0], 'New Algorand Account Selected');
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  // initialise IPFS
  useEffect( () => {
    new IPFSAlgoWrapper().init();
  }, []);

  // fetch initial user state when switched from logged out to logged in
  useEffect( () => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated]);

  return (
    <div>
      <NavbarManager/>
      <NotificationContainer/>
      <Switch>
        <ProtectedRoute exact path="/dashboard" component={DashboardPage}/>
        <ProtectedRoute exact path="/issuer" component={IssuerPageContainer}/>
        <ProtectedRoute exact path="/investor" component={InvestorPageContainer}/>
        <ProtectedRoute exact path="/green-verifier" component={GreenVerifierPageContainer}/>
        <ProtectedRoute exact path="/financial-regulator" component={FinancialRegulatorPageContainer}/>
        <ProtectedRoute exact path="/settings" component={SettingsPage}/>
        {/*Placed last to catch all unknown paths*/}
        <Route component={HomePage}/>
      </Switch>
    </div>
  );
}

const mapDispatchToProps = {
  setAccountAddresses,
  setSelectedAccount
};

export default connect(undefined, mapDispatchToProps)(App);
