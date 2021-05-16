import React from 'react';
import Typography from '@material-ui/core/Typography';

interface HomePageProps {
}

function HomePage(props: HomePageProps) {

  return (
    <div className={"page-content"}>
      <div className={'home-text'}>
        <Typography variant="h1" gutterBottom>
          Issuing Green Bonds on the Blockchain
        </Typography>
        <Typography variant="h4" gutterBottom>
          Demo application
        </Typography>
      </div>
    </div>
  );
}

export default HomePage;
