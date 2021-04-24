import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Nav from 'react-bootstrap/Nav';

const LogoutNav = () => {
  const { logout } = useAuth0();

  return (
    <Nav.Link
      onClick={() =>
        logout({
          returnTo: window.location.origin
        })
      }
    >
      Log Out
    </Nav.Link>
  );
};

export default LogoutNav;