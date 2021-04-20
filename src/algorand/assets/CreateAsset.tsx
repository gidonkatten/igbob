import { algodClient, masterAccount, waitForConfirmation } from '../utils/Utils';
import { ConfirmedTxInfo, SuggestedParams, Transaction, TxnBytes, TxResult } from 'algosdk';

const algosdk = require('algosdk');

/**
 * Create asset using stored account
 * @function
 * @param {number} totalIssuance -
 * @param {number} assetDecimals - Number of decimals for asset unit calculation
 * @param {boolean} defaultFrozen -
 * @param {string} unitName -
 * @param {string} assetName -
 * @param {SuggestedParams | undefined} params -
 * @returns {Promise<number>} The ID of the created asset
 */
export async function createAsset(
  totalIssuance: number,
  assetDecimals: number,
  defaultFrozen: boolean,
  unitName: string,
  assetName: string,
  params?: SuggestedParams
): Promise<number> {
  if (params === undefined) {
    // Get node suggested parameters
    let txParams = await algodClient.getTransactionParams().do();
    txParams.fee = 1000;
    txParams.flatFee = true;
    params = txParams;
  }

  // create, sign and submit
  const txn: Transaction = algosdk.makeAssetCreateTxnWithSuggestedParams(masterAccount.addr, undefined,
    totalIssuance, assetDecimals, defaultFrozen, undefined, undefined, undefined,
    undefined, unitName, assetName, undefined, undefined, params);
  const rawSignedTxn: TxnBytes = txn.signTxn(masterAccount.sk)
  const txResult: TxResult = (await algodClient.sendRawTransaction(rawSignedTxn).do());

  await waitForConfirmation(txResult.txId);

  // Get the new asset's id
  const pendingTx: ConfirmedTxInfo = await algodClient.pendingTransactionInformation(txResult.txId).do();
  const assetId: number = pendingTx["asset-index"];
  console.log("AssetId = " + assetId);

  return assetId;
}