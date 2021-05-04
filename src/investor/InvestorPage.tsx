import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { buyBond } from '../algorand/buy/Buy';
import { optIntoAsset } from '../algorand/assets/OptIntoAsset';
import { useAuth0 } from '@auth0/auth0-react';
import { setApps } from '../redux/actions/actions';
import { App } from '../redux/reducers/bond';

interface InvestorPageProps {
  selectedAddress?: string;
  apps: App[]
  setApps: typeof setApps;
}

function InvestorPage(props: InvestorPageProps) {
  const [optInBondId, setOptInBondId] = useState<number>(0);
  const [appId, setAppId] = useState<number>(0);
  const [buyBondId, setBuyBondId] = useState<number>(0);
  const [bondAmount, setBondAmount] = useState<number>(0);
  const [algoAmount, setAlgoAmount] = useState<number>(0);

  const { selectedAddress } = props;
  const { getAccessTokenSilently } = useAuth0();

  async function fetchApps() {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch("https://igbob.herokuapp.com/apps/all-apps", {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      const parseResponse = await response.json();
      setApps(parseResponse);
    } catch (err) {
      console.error(err.message);
    }
  }

  // fetch apps after initial render
  useEffect( () => {
    fetchApps();
  }, []);

  const handleAssetOptIn = async (e: any) => {
    e.preventDefault();
    if (!optInBondId || !selectedAddress) return;
    await optIntoAsset(optInBondId, selectedAddress)
  }

  const handleBuy = async (e: any) => {
    e.preventDefault();
    if (!selectedAddress) return;
    await buyBond(appId, selectedAddress, buyBondId, bondAmount, algoAmount);
  }

  return (
    <div>

    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedAddress: state.userReducer.selectedAddress,
  apps: state.userReducer.apps
});

const mapDispatchToProps = {
  setApps
};

export default connect(mapStateToProps, mapDispatchToProps)(InvestorPage);