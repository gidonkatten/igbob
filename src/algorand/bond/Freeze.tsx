import { OnApplicationComplete, SuggestedParams } from "algosdk";
import { algodClient, numberToUint8Array, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Freeze (all / account's) bonds using MyAlgo
 * freezeAddr undefined iff isAll true
 */
export async function freeze(
  mainAppId: number,
  financialRegulatorAddr: string,
  toFreeze: boolean,
  isAll: boolean,
  freezeAddr?: string,
): Promise<string> {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;

  const enc = new TextEncoder();
  const freeze: Uint8Array = enc.encode(isAll ? "freeze_all" : "freeze");
  const val: Uint8Array = numberToUint8Array(toFreeze ? 0 : 1);
  const mainAppArgs: Uint8Array[] = [freeze, val];

  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: financialRegulatorAddr,
    appIndex: mainAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: mainAppArgs,
    appAccounts: isAll ? undefined : [freezeAddr!],
  }

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(callMainAppTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);

  return tx.txId;
}
