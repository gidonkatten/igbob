import { OnApplicationComplete, SuggestedParams } from "algosdk";
import { algodClient, numberToUint8Array, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Set green rating using MyAlgo
 */
export async function rate(
  appId: number,
  greenVerifierAddr: string,
  rating: number,
): Promise<string> {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;

  const enc = new TextEncoder();
  const rate: Uint8Array = enc.encode("rate");

  const ratingPassed: Uint8Array = numberToUint8Array(rating);

  const manageAppArgs: Uint8Array[] = [rate, ratingPassed];
  const callManageAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: greenVerifierAddr,
    appIndex: appId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: manageAppArgs,
  }

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(callManageAppTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);

  return tx.txId;
}
