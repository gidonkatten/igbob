import { algodClient, downloadTxns, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, Base64, CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { SuggestedParams, TxSig } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Create and submit a stateful smart contract
 */
export async function buyBond(
  buyerAddr: string,
  appId: number,
  issuerAddr: string,
  bondId: number,
  bondEscrowAddr: string,
  bondEscrowProgram: string,
  noOfBonds: number,
  bondCost: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // 0. call app
  const enc = new TextEncoder();
  const buy: Uint8Array = enc.encode("buy");

  const appArgs: Uint8Array[] = [buy];
  const callAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: buyerAddr,
    appIndex: appId,
    appOnComplete: 0,
    appArgs: appArgs
  }

  // 1. bond transfer
  const compiledProgram = await algodClient.compile(bondEscrowProgram).do();
  const programBytes = new Uint8Array(
    Buffer.from(compiledProgram.result, 'base64')
  );
  const lsig = algosdk.makeLogicSig(programBytes);
  const bondTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    bondEscrowAddr,
    buyerAddr,
    undefined,
    bondEscrowAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 2. pay fee
  const algoTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: buyerAddr,
    to: bondEscrowAddr,
    amount: 1000,
  };

  // 3. stablecoin payment
  const stablecoinTransferTxn: AssetTxn = {
    ...params,
    type: "axfer",
    from: buyerAddr,
    assetIndex: STABLECOIN_ID,
    to: issuerAddr,
    amount: noOfBonds * bondCost,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callAppTxn,
    bondTransferTxn,
    algoTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = buyerAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[2].from = buyerAddr;
  txns[2].to = bondEscrowAddr;
  txns[2].genesisHash = params.genesisHash;
  txns[3].from = buyerAddr;
  txns[3].to = issuerAddr;
  txns[3].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedBondTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[1], lsig);
  const signedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[2]);
  const signedStablecoinTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[3]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallAppTxn.blob,
    signedBondTransferTxn.blob,
    signedAlgoTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}