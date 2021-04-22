import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  const printToken = async () => {
    console.log(JSON.stringify(user));
    const token = await getAccessTokenSilently();
    console.log(token);
  }

  return (
    <div>
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={printToken}>Print Token</button>
    </div>
  )
};

export default Profile;
