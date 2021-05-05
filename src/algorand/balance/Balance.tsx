import { algodClient } from '../utils/Utils';
import algosdk from 'algosdk';
import { Asset, UserAccount } from '../../redux/reducers/user';

export async function getAccountInformation(address: string): Promise<UserAccount> {
  const account = await algodClient.accountInformation(address).do();

  const algoBalance = algosdk.microalgosToAlgos(account.amount);
  const assets: Asset[] = account.assets.map(asset => ({
    assetId: asset['asset-id'],
    amount: asset.amount
  }))

  return {
    address: address,
    algoBalance: algoBalance,
    assets: assets
  }
}
