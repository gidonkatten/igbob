import React from "react";
import { Route, Switch } from 'react-router-dom';
import IssuerPage from "./issuer/IssuerPage";
import InvestorPage from "./investor/InvestorPage";
import HomePage from "./home/HomePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import Profile from "./auth/Profile";
import SettingsPage from "./settings/SettingsPage";
import NavbarManager from "./navbar/NavbarManager";
import DashboardPage from "./dashboard/DashboardPage";

function App() {
  return (
    <div>
      <NavbarManager/>
      <Switch>
        <ProtectedRoute exact path="/dashboard" component={DashboardPage}/>
        <ProtectedRoute exact path="/issuer" component={IssuerPage}/>
        <ProtectedRoute exact path="/investor" component={InvestorPage}/>
        <ProtectedRoute exact path="/settings" component={SettingsPage}/>
        <ProtectedRoute exact path="/profile" component={Profile}/>
        {/*Placed last to catch all unknown paths*/}
        <Route component={HomePage}/>
      </Switch>
    </div>
  );
}

export default App;
