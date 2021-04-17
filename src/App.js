import React from "react";
import { Route, Switch } from 'react-router-dom';
import IssuerPage from "./issuer/IssuerPage";
import InvestorPage from "./investor/InvestorPage";
import HomePage from "./home/HomePage";
import Navbar from "./Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <div>
      <Navbar/>
      <Switch>
        <ProtectedRoute path="/issuer" component={IssuerPage} />
        <Route exact path="/investor" component={InvestorPage}/>
        {/*Placed last to catch all unknown paths*/}
        <Route path="/" component={HomePage}/>
      </Switch>
    </div>
  );
}

export default App;
