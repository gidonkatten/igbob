import { algodClient, STABLECOIN_ID } from '../utils/Utils';
import algosdk from 'algosdk';
import { Asset, UserAccount } from '../../redux/reducers/user';

export async function getAccountInformation(address: string): Promise<UserAccount> {
  const account = await algodClient.accountInformation(address).do();

  const algoBalance = algosdk.microalgosToAlgos(account.amount);
  const assets: Asset[] = account.assets.map(asset => {
    const amount = asset['asset-id'] === STABLECOIN_ID ? asset.amount / 1e6 : asset.amount;
    return {
      assetId: asset['asset-id'],
      amount: amount, // TODO: format amount for fractional bond decimals
    }
  })

  return {
    address: address,
    algoBalance: algoBalance,
    assets: assets
  }
}
