import { SuggestedParams, TxSig } from "algosdk";
import { algodClient, waitForConfirmation } from '../utils/Utils';
import { AssetTxn } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Opt into asset using MyAlgo
 */
export async function optIntoAsset(assetId: number, addr: string) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();

  let optTxn: AssetTxn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: 'axfer',
    from: addr,
    to: addr,
    amount: 0,
    assetIndex: assetId
  };

  let rawSignedOptTxn = await myAlgoWallet.signTransaction(optTxn) as TxSig;
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}