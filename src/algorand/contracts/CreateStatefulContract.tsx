import { algodClient, masterAccount, waitForConfirmation } from '../utils/Utils';
import { compileProgram, loadFile } from './Utils';
import { ConfirmedTxInfo, SuggestedParams, Transaction, TxnBytes, TxResult } from 'algosdk';

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
 * @param {SuggestedParams | undefined} params -
 * @returns {Promise<number>} The ID of the created application
 */
export async function createStatefulContract(
  approvalProgramUrl: string,
  clearProgramUrl: string,
  stateStorage: StateStorage,
  appArgs: Uint8Array[],
  params?: SuggestedParams
): Promise<number> {
  if (params === undefined) {
    // Get node suggested parameters
    let txParams = await algodClient.getTransactionParams().do();
    txParams.fee = 1000;
    txParams.flatFee = true;
    params = txParams;
  }

  const approval: string | null = loadFile(approvalProgramUrl);
  const clear: string | null  = loadFile(clearProgramUrl);
  if (approval === null || clear === null) {
    console.error("Cannot get teal programs");
    return -1;
  }

  let approvalProgram: Uint8Array = await compileProgram(approval);
  let clearProgram: Uint8Array = await compileProgram(clear);

  const { localInts, localBytes, globalInts, globalBytes } = stateStorage;
  const onComplete: number = algosdk.OnApplicationComplete.NoOpOC;

  // // create unsigned transaction
  const txn: Transaction = algosdk.makeApplicationCreateTxn(masterAccount.addr, params,
    onComplete, approvalProgram, clearProgram, localInts, localBytes, globalInts,
    globalBytes, appArgs);
  const rawSignedTxn: TxnBytes = txn.signTxn(masterAccount.sk)
  const txResult: TxResult  = (await algodClient.sendRawTransaction(rawSignedTxn).do());

  await waitForConfirmation(txResult.txId);

  // Get the new app's id
  const pendingTx: ConfirmedTxInfo = await algodClient.pendingTransactionInformation(txResult.txId).do();
  const appId: number = pendingTx["application-index"];
  console.log("AppId = " + appId);

  return appId;
}