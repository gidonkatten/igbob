import { algodClient, waitForConfirmation } from '../utils/Utils';
import { Base64, CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { Account, SuggestedParams, TxnBytes } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Create and submit a stateful smart contract
 */
export async function buyBond(
  appId: number,
  buyer: string,
  bondId: number,
  amountBond: number,
  amountAlgo: number,
) {
  const recoveredAccount: Account = algosdk.mnemonicToSecretKey(process.env.REACT_APP_ALGOD_ACCOUNT_MNEMONIC);
  const addr = recoveredAccount.addr;

  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // Transaction 1: call app
  const buy: Base64 = "buy";
  const appArgs: Base64[] = [buy];
  let callAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: buyer,
    appIndex: appId,
    appOnComplete: 0,
    appArgs: appArgs
  }

  // Transaction 2: pay algo
  const algoTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: buyer,
    to: addr,
    amount: amountAlgo,
  };


  // Transaction 3: receive bond
  let assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    addr, buyer, undefined, undefined, amountBond, undefined, bondId, params
  );

  // Sign transactions and group
  let rawSignedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(callAppTxn);
  const rawSignedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(algoTransferTxn);
  const rawSignedAssetTransferTxn: TxnBytes = assetTransferTxn.signTxn(recoveredAccount.sk);
  const signedTxs: Uint8Array[] = [rawSignedCallAppTxn.blob, rawSignedAlgoTransferTxn.blob, rawSignedAssetTransferTxn];

  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(algodClient, tx.txId);

}