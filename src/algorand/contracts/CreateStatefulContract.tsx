import { client, waitForConfirmation } from '../utils/Utils';
import { compileProgram, loadFile } from './Utils';

const algosdk = require('algosdk');

export interface StateStorage {
  localInts: number,
  localBytes: number,
  globalInts: number,
  globalBytes: number
}

/**
 * Create and submit a stateful smart contract
 * @function
 * @param {string} approvalProgramUrl - Url of approval program (in TEAL)
 * @param {string} clearProgramUrl - Url of clear program (in TEAL)
 * @param {StateStorage} stateStorage -
 * @param {Uint8Array[]} appArgs - arguments to the smart contract
 * @returns {Promise<number>} The ID of the created application
 */
export async function createStatefulContract(
  approvalProgramUrl: string,
  clearProgramUrl: string,
  stateStorage: StateStorage,
  appArgs: Uint8Array[],
): Promise<number> {
  let approval = loadFile(approvalProgramUrl);
  let clear = loadFile(clearProgramUrl);
  if (approval === null || clear === null) {
    console.error("Cannot get teal programs");
    return -1;
  }

  let creatorAccount = algosdk.mnemonicToSecretKey(process.env.REACT_APP_ALGOD_ACCOUNT_MNEMONIC);
  let sender = creatorAccount.addr;
  let approvalProgram: Uint8Array = await compileProgram(client, approval);
  let clearProgram: Uint8Array = await compileProgram(client, clear);

  const { localInts, localBytes, globalInts, globalBytes } = stateStorage;

  // Get node suggested parameters
  let params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // Declare onComplete as NoOp
  let onComplete = algosdk.OnApplicationComplete.NoOpOC;

  // create unsigned transaction
  let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete,
    approvalProgram, clearProgram, localInts, localBytes, globalInts,
    globalBytes, appArgs);
  let txId = txn.txID().toString();

  // Sign the transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  // Wait for confirmation
  await waitForConfirmation(client, txId);

  // Display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  let appId = transactionResponse['application-index'];
  console.log("Created new app-id: ", appId);

  return appId;
}