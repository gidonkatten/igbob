import { algodClient, STABLECOIN_ID } from '../utils/Utils';
import algosdk from 'algosdk';
import { UserAccount } from '../../redux/reducers/user';

export async function getAccountInformation(address: string): Promise<UserAccount> {
  const account = await algodClient.accountInformation(address).do();

  const algoBalance = algosdk.microalgosToAlgos(account.amount);

  let optedIn = false;
  let stablecoinBalance = 0;
  account.assets.forEach(asset => {
    if (asset['asset-id'] === STABLECOIN_ID) {
      optedIn = true;
      stablecoinBalance = asset.amount / 1e6;
    }
  })

  return {
    address: address,
    algoBalance: algoBalance,
    optedIntoStablecoin: optedIn,
    stablecoinBalance: stablecoinBalance,
  }
}
