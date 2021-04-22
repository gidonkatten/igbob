import React from "react";
import { Link } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";
import AuthenticationButton from './auth/AuthenticationButton';
import SignupButton from './auth/SignupButton';

function Navbar() {
  const {
    isAuthenticated
  } = useAuth0();


  return (
    <div>
      <Link to="/igbob">Home</Link>
      {!isAuthenticated && (
        <SignupButton/>
      )}
      <AuthenticationButton/>
      {isAuthenticated && (
        <Link to="/igbob/issuer">Issuer</Link>
      )}
      {isAuthenticated && (
        <Link to="/igbob/investor">Investor</Link>
      )}
    </div>
  );
}

export default Navbar;