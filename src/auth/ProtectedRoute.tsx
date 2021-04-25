import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { userHasAccess } from './Utils';

class RedirectToHome extends React.Component {
  render() {
    return <Redirect to="/"/>
  };
}

const ProtectedRoute = ({ component, ...args }) => {

  const { role, ...otherProps } = args;
  const { user } = useAuth0();
  const page = role === undefined ? component : (userHasAccess(user, role) ? component : RedirectToHome)

  return (
    <Route
      component={withAuthenticationRequired(page, {
        onRedirecting: () => <div>Redirecting you to the login...</div>,
        returnTo: '/dashboard'
      })}
      {...otherProps}
    />
  );
};

export default ProtectedRoute;