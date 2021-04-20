import React from "react";
import { Route, Switch } from 'react-router-dom';
import IssuerPage from "./issuer/IssuerPage";
import InvestorPage from "./investor/InvestorPage";
import HomePage from "./home/HomePage";
import Navbar from "./Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Profile from "./auth/Profile";

function App() {
  return (
    <div>
      <Navbar/>
      <Switch>
        <ProtectedRoute path="/issuer" component={IssuerPage} role={"issuer"} />
        <ProtectedRoute exact path="/investor" component={InvestorPage} role={"investor"}/>
        <ProtectedRoute exact path="/profile" component={Profile}/>
        {/*Placed last to catch all unknown paths*/}
        <Route path="/" component={HomePage}/>
      </Switch>
    </div>
  );
}

export default App;
