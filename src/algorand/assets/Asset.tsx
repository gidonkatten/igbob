import { SuggestedParams } from "algosdk";
import { algodClient, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

/**
 * Transfer asset using MyAlgo
 */
export async function transferAsset(
  assetId: number,
  from: string,
  to: string,
  amount: number
) {
  const params: SuggestedParams = await algodClient.getTransactionParams().do();

  const txm: AssetTxn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: 'axfer',
    from,
    to,
    amount,
    assetIndex: assetId
  };

  const rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(txm);
  const tx = await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do();

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}

/**
 * Opt into asset using MyAlgo
 */
export async function optIntoAsset(assetId: number, addr: string) {
  await transferAsset(assetId, addr, addr, 0);
}
