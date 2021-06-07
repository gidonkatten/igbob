import { algodClient, indexerClient, STABLECOIN_ID } from '../utils/Utils';
import algosdk, { modelsv2 } from 'algosdk';
import { ApplicationLocalState, TealKeyValue } from 'algosdk/dist/types/src/client/v2/algod/models/types';
import { extractAppState } from '../../utils/Utils';
import { AppAccount, AppState, UserAccount } from '../../redux/types';
import { getStateValue } from '../../investor/Utils';

/**
 * Get account information using Algorand address
 * Includes asset balances and applicaton local states
 */
export async function getAccountInformation(address: string): Promise<UserAccount> {
  const account: modelsv2.Account = await algodClient.accountInformation(address).do();

  const algoBalance = algosdk.microalgosToAlgos(account.amount as number);

  const assets: Map<number, number | bigint> = new Map();
  if (account.assets) {
    account.assets.forEach(asset => {
      assets.set(asset['asset-id'], asset.amount);
    })
  }

  const appsLocalState: Map<number, AppState> = new Map();

  const appLocalStates: ApplicationLocalState[] | undefined = account['apps-local-state'];
  if (appLocalStates) {
    // For each opted into app of account
    appLocalStates.forEach(appLocalState => {
      const statePairs: TealKeyValue[] | undefined = appLocalState['key-value']
      appsLocalState.set(appLocalState.id as number, extractAppState(statePairs));
    })
  }

  return {
    address,
    algoBalance,
    assets,
    appsLocalState
  }
}

/**
 * Get accounts opted into an app
 */
export async function getAppAccounts(appId: number, bondId: number): Promise<AppAccount[]> {
  const addresses: AppAccount[] = [];

  // Fetch opted in accounts
  const res = await indexerClient.searchAccounts().applicationID(appId).do();
  const accounts: modelsv2.Account[] = res.accounts;

  accounts.forEach(acc => {

    // Set balance
    let balance: number = 0;
    if (acc.assets) {
      acc.assets.forEach(asset => {
        if (asset['asset-id'] == bondId) balance = asset.amount as number;
      });
    }

    // Set frozen
    let frozen: boolean = true;
    const appLocalStates: ApplicationLocalState[] | undefined = acc['apps-local-state'];
    if (appLocalStates) {
      const foundIndex = appLocalStates.findIndex(state => state.id === appId);
      if (foundIndex >= 0) {
        const appLocalState: ApplicationLocalState = appLocalStates[foundIndex];
        const statePairs: TealKeyValue[] | undefined = appLocalState['key-value']
        frozen = getStateValue('Frozen', extractAppState(statePairs)) === 0;
      }
    }

    addresses.push({
      addr: acc.address,
      balance,
      frozen,
    })
  });

  return addresses;
}

/**
 * Get bonds available (+ frozen) for given account
 */
export async function getAppAccountTrade(
  addr: string,
  appId: number,
  bondId: number,
): Promise<{ balance: number, frozen: boolean }> {
  const acc: UserAccount = await getAccountInformation(addr);

  const { appsLocalState } = acc;
  let balance: number = 0;
  let frozen: boolean = true;

  if (appsLocalState.has(appId)) {
    const localState: AppState = appsLocalState.get(appId)!;
    balance = Math.min(
      getStateValue("Trade", localState),
      acc.assets.has(bondId) ? acc.assets.get(bondId) as number : 0
    ) / 1e6;
    frozen = getStateValue('Frozen', localState) === 0;
  }

  return { balance, frozen };
}

/**
 * Get asset balance for account
 */
export function getAssetBalance(account: UserAccount, assetId: number): number | bigint {
  const assets: Map<number, number | bigint> = account.assets;
  return assets.has(assetId) ? assets.get(assetId)! : 0;
}

/**
 * Get stablecoin balance for account
 */
export function getStablecoinBalance(account: UserAccount): number | bigint {
  const assets: Map<number, number | bigint> = account.assets;
  return assets.has(STABLECOIN_ID) ? assets.get(STABLECOIN_ID)! : 0;
}
