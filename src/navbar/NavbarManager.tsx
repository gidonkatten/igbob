import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SignupNav from './SignupNav';
import { LinkContainer } from "react-router-bootstrap";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import LogoutNav from './LogoutNav';
import LoginNav from './LoginNav';

function NavbarManager() {
  const { isAuthenticated } = useAuth0();

  return (
    <div>
      <Navbar bg="light" variant="light">

        {/*Left hand side of navbar*/}
        <Nav className="mr-auto">
          <LinkContainer to="/home">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          {isAuthenticated && (
            <LinkContainer to="/dashboard">
              <Nav.Link>Dashboard</Nav.Link>
            </LinkContainer>
          )}
          {isAuthenticated && (
            <LinkContainer to="/issuer">
              <Nav.Link>Issuer</Nav.Link>
            </LinkContainer>
          )}
          {isAuthenticated && (
            <LinkContainer to="/investor">
              <Nav.Link>Investor</Nav.Link>
            </LinkContainer>
          )}
        </Nav>

        {/*Right hand side of navbar*/}
        <Nav>
          {isAuthenticated && (
            <LinkContainer to="/settings">
              <Nav.Link>Settings</Nav.Link>
            </LinkContainer>
          )}
          {isAuthenticated && (
            <LinkContainer to="/profile">
              <Nav.Link>Profile</Nav.Link>
            </LinkContainer>
          )}
          {!isAuthenticated && <SignupNav/>}
          {isAuthenticated ? <LogoutNav /> : <LoginNav />}
        </Nav>

      </Navbar>

    </div>
  );
}

export default NavbarManager;