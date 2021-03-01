import React from "react";
import {Link, Route, Switch} from 'react-router-dom';
import IssuerPage from "./issuer/IssuerPage";
import InvestorPage from "./investor/InvestorPage";
import HomePage from "./home/HomePage";

function App() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/issuer">Issuer</Link>
      <Link to="/investor">Investor</Link>
      <Switch>
        <Route exact path="/issuer">
          <IssuerPage/>
        </Route>
        <Route exact path="/investor">
          <InvestorPage/>
        </Route>
        {/*Placed last to catch all unknown paths*/}
        <Route path="/">
          <HomePage/>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
