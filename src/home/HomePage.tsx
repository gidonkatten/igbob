import React from 'react';
import Typography from '@material-ui/core/Typography';
import blockchainBackground from '../img/blockchainbackground.png';


interface HomePageProps {
}

function HomePage(props: HomePageProps) {

  return (
    <div className={"page-content"}>
      <img className={"home-image"} src={blockchainBackground}/>
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
