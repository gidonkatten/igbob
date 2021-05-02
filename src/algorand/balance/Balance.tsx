import { algodClient, STABLECOIN_ID } from '../utils/Utils';
import * as algosdk from 'algosdk';

export async function getAccountInformation(
  address: string, 
  setAlgoBalance: any,
  setStablecoinBalance: any
) {
  const account = await algodClient.accountInformation(address).do();

  setAlgoBalance(algosdk.microalgosToAlgos(account.amount))
  account.assets.forEach(asset => {
    if (asset['asset-id'] === STABLECOIN_ID) setStablecoinBalance(asset.amount / 1e6);
  })
}