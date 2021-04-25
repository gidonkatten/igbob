import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Nav from 'react-bootstrap/Nav';

const LoginNav = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Nav.Link
      onClick={() =>
        loginWithRedirect({
          redirectUri: window.location.origin + '/dashboard',
        })
      }
    >
      Log In
    </Nav.Link>
  );
};

export default LoginNav;