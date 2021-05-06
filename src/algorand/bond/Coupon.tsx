import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { SuggestedParams, TxSig } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Create and submit a stateful smart contract
 */
export async function claimCoupon(
  investorAddr: string,
  appId: number,
  stablecoinEscrowAddr: string,
  stablecoinEscrowProgram: string,
  noOfBonds: number,
  bondCoupon: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // 0. call app
  const enc = new TextEncoder();
  const coupon: Uint8Array = enc.encode("coupon");
  const appArgs: Uint8Array[] = [coupon];
  const callAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: investorAddr,
    appIndex: appId,
    appOnComplete: 0,
    appArgs: appArgs
  }

  // 1. pay fee for tx2
  const algoTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: investorAddr,
    to: stablecoinEscrowAddr,
    amount: 1000,
  };

  // 2. stablecoin payment
  const compiledProgram = await algodClient.compile(stablecoinEscrowProgram).do();
  const programBytes = new Uint8Array(
    Buffer.from(compiledProgram.result, 'base64')
  );
  const lsig = algosdk.makeLogicSig(programBytes);
  const stablecoinTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    stablecoinEscrowAddr,
    investorAddr,
    undefined,
    undefined,
    noOfBonds * bondCoupon,
    undefined,
    STABLECOIN_ID,
    params
  );

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callAppTxn,
    algoTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[1].from = investorAddr;
  txns[1].to = stablecoinEscrowAddr;
  txns[1].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[1]);
  const signedStablecoinTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[2], lsig);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallAppTxn.blob,
    signedAlgoTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}