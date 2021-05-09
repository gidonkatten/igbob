import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { SuggestedParams, TxSig } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Buy a bond
 */
export async function buyBond(
  investorAddr: string,
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
    to: bondEscrowAddr,
    amount: 1000,
  };

  // 2. bond transfer
  const compiledProgram = await algodClient.compile(bondEscrowProgram).do();
  const programBytes = new Uint8Array(
    Buffer.from(compiledProgram.result, 'base64')
  );
  const lsig = algosdk.makeLogicSig(programBytes);
  const bondTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    bondEscrowAddr,
    investorAddr,
    undefined,
    bondEscrowAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 3. stablecoin payment
  const stablecoinTransferTxn: AssetTxn = {
    ...params,
    type: "axfer",
    from: investorAddr,
    assetIndex: STABLECOIN_ID,
    to: issuerAddr,
    amount: noOfBonds * bondCost,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callAppTxn,
    algoTransferTxn,
    bondTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[1].from = investorAddr;
  txns[1].to = bondEscrowAddr;
  txns[1].genesisHash = params.genesisHash;
  txns[3].from = investorAddr;
  txns[3].to = issuerAddr;
  txns[3].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[1]);
  const signedBondTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[2], lsig);
  const signedStablecoinTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[3]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallAppTxn.blob,
    signedAlgoTransferTxn.blob,
    signedBondTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}