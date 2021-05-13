import { SuggestedParams } from "algosdk";
import { algodClient, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Opt into asset using MyAlgo
 */
export async function optIntoAsset(assetId: number, addr: string) {
  const params: SuggestedParams = await algodClient.getTransactionParams().do();

  const optTxn: AssetTxn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: 'axfer',
    from: addr,
    to: addr,
    amount: 0,
    assetIndex: assetId
  };

  const rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(optTxn);
  const tx = await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do();

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}