import React from "react";
import {Route, Switch} from 'react-router-dom';
import IssuerPage from "./issuer/IssuerPage";
import InvestorPage from "./investor/InvestorPage";

function App() {
  return (
    <Switch>
      <Route exact path="/issuer">
        <IssuerPage/>
      </Route>
      <Route exact path="/investor">
        <InvestorPage/>
      </Route>
      {/*Placed last to catch all unknown paths*/}
      <Route path="/">
        Home
      </Route>
    </Switch>
  );
}

export default App;
