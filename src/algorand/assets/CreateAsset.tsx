import { client, waitForConfirmation } from '../utils/Utils';
import { printAssetHolding, printCreatedAsset } from './Utils';

const algosdk = require('algosdk');

/**
 * Create asset using stored account
 * @function
 * @param {number} totalIssuance -
 * @param {number} decimals - Number of decimals for asset unit calculation
 * @param {string} unitName -
 * @param {string} assetName -
 * @returns {Promise<number>} The ID of the created asset
 */
export async function createAsset(
  totalIssuance: number,
  decimals: number,
  unitName: string,
  assetName: string
): Promise<number> {
  let recoveredAccount = algosdk.mnemonicToSecretKey(process.env.REACT_APP_ALGOD_ACCOUNT_MNEMONIC);

  // Get node suggested parameters
  let params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // Asset creation specific parameters
  let addr = recoveredAccount.addr;
  let defaultFrozen = false; // whether user accounts will need to be unfrozen before transacting

  // Signing and sending "txn" allows "addr" to create an asset
  let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(addr, undefined,
    totalIssuance, decimals, defaultFrozen, undefined, undefined, undefined,
    undefined, unitName, assetName, undefined, undefined, params);

  let rawSignedTxn = txn.signTxn(recoveredAccount.sk)
  let tx = (await client.sendRawTransaction(rawSignedTxn).do());
  console.log("Transaction : " + tx.txId);

  // Wait for transaction to be confirmed
  await waitForConfirmation(client, tx.txId);

  // Get the new asset's information from the creator account
  let ptx = await client.pendingTransactionInformation(tx.txId).do();
  let assetID = ptx["asset-index"];
  console.log("AssetID = " + assetID);

  // Print asset details
  await printCreatedAsset(client, recoveredAccount.addr, assetID);
  await printAssetHolding(client, recoveredAccount.addr, assetID);

  return assetID;
}