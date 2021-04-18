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
      <Link to="/">Home</Link>
      {!isAuthenticated && (
        <SignupButton/>
      )}
      <AuthenticationButton/>
      {isAuthenticated && (
        <Link to="/issuer">Issuer</Link>
      )}
      {isAuthenticated && (
        <Link to="/investor">Investor</Link>
      )}
    </div>
  );
}

export default Navbar;