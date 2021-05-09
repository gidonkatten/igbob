import { algodClient, STABLECOIN_ID } from '../utils/Utils';
import algosdk from 'algosdk';
import { AppLocalState, Asset, UserAccount } from '../../redux/reducers/user';

export async function getAccountInformation(address: string): Promise<UserAccount> {
  const account = await algodClient.accountInformation(address).do();

  const algoBalance = algosdk.microalgosToAlgos(account.amount);
  const assets: Asset[] = account.assets.map(asset => ({
    assetId: asset['asset-id'],
    amount: asset.amount
  }))
  const apps: AppLocalState[] = account['apps-local-state'].map(app => {
    const coupons = app['key-value'] && app['key-value'][0] ?
      app['key-value'][0].value.uint : 0;
    return {
      appId: app.id,
      couponRoundsColl: coupons
    }
  })

  return {
    address,
    algoBalance,
    assets,
    apps
  }
}

/**
 * Get asset balance for account
 */
export function getAssetBalance(account: UserAccount, assetId: number): number {
  let balance = 0;
  account.assets.forEach(asset => {
    if (asset.assetId === assetId) balance = asset.amount;
  })
  return balance;
}

/**
 * Get stablecoin balance for account
 */
export function getStablecoinBalance(account: UserAccount): number {
  return getAssetBalance(account, STABLECOIN_ID);
}
