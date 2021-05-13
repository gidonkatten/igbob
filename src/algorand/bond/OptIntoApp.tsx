import { SuggestedParams } from "algosdk";
import { algodClient, waitForConfirmation } from '../utils/Utils';
import { OptInApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Opt into asset using MyAlgo
 */
export async function optIntoApp(appId: number, addr: string) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();

  let optTxn: OptInApplTxn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: 'appl',
    from: addr,
    appIndex: appId,
    appOnComplete: 1
  };

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(optTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}