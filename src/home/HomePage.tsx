import React from 'react';

interface HomePageProps {
}

function HomePage(props: HomePageProps) {

  return (
    <div className={"page-content"}>
      <div className={'home-text'}>
        <h1>Welcome to Issuing Green Bonds on the Blockchain</h1>
        <h3>Demo application</h3>
      </div>
    </div>
  );
}

export default HomePage;
