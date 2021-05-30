import { OnApplicationComplete, SuggestedParams } from "algosdk";
import { algodClient, numberToUint8Array, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Set number of bonds willing to trade
 */
export async function setTrade(
  mainAppId: number,
  selectedAddr: string,
  trade: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;

  const enc = new TextEncoder();
  const rate: Uint8Array = enc.encode("set_trade");

  const tradePassed: Uint8Array = numberToUint8Array(trade);

  const appArgs: Uint8Array[] = [rate, tradePassed];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: selectedAddr,
    appIndex: mainAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: appArgs,
  }

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(callMainAppTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}

/**
 * Sign trade lsig
 */
export async function signTradeLSig(
  program: Uint8Array,
  selectedAddr: string,
) {
  return await myAlgoWallet.signLogicSig(program, selectedAddr);
}