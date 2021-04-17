import { SuggestedParams, TxSig } from "algosdk";
import { client, waitForConfirmation } from '../utils/Utils';
import { AssetTxn } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/Wallet';

const algosdk = require('algosdk');

/**
 * Opt into asset using MyAlgo
 * @function
 * @param {number} assetId -
 * @param {string} addr -
 */
export async function optIntoAsset(
  assetId: number,
  addr: string,
) {
  let params: SuggestedParams = await client.getTransactionParams().do();

  let assetTransferTxn: AssetTxn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: 'axfer',
    from: addr,
    to: addr,
    amount: 0,
    assetIndex: assetId
  };

  // let rawSignedAssetTransferTxn = assetTransferTxn.signTxn(recoveredAccountOwner.sk)
  let rawSignedAssetTransferTxn = await myAlgoWallet.signTransaction(assetTransferTxn) as TxSig;
  let tx = (await client.sendRawTransaction(rawSignedAssetTransferTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(client, tx.txId);
}