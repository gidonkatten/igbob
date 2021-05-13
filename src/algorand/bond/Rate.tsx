import { OnApplicationComplete, SuggestedParams } from "algosdk";
import { algodClient, numberToUint8Array, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Opt into asset using MyAlgo
 */
export async function rate(
  manageAppId: number,
  greenVerifierAddr: string,
  round: number,
  rating: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();

  const enc = new TextEncoder();
  const rate: Uint8Array = enc.encode("rate");

  const roundPassed: Uint8Array = numberToUint8Array(round);
  const ratingPassed: Uint8Array = numberToUint8Array(rating);

  const manageAppArgs: Uint8Array[] = [rate, roundPassed, ratingPassed];
  const callManageAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: greenVerifierAddr,
    appIndex: manageAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: manageAppArgs,
  }

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(callManageAppTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}