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
  mainAppId: number,
  manageAppId: number,
  stablecoinEscrowAddr: string,
  stablecoinEscrowProgram: string,
  noOfBonds: number,
  bondCoupon: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("coupon")];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: investorAddr,
    appIndex: mainAppId,
    appOnComplete: 0,
    appArgs: mainAppArgs
  }

  // 1. call manage app
  const manageAppArgs: Uint8Array[] = [enc.encode("not_defaulted")];
  const callManageAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: investorAddr,
    appIndex: manageAppId,
    appOnComplete: 0,
    appArgs: manageAppArgs
  }

  // 2. pay fee for tx3
  const algoTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: investorAddr,
    to: stablecoinEscrowAddr,
    amount: 1000,
  };

  // 3. stablecoin payment
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
    callMainAppTxn,
    callManageAppTxn,
    algoTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[1].from = investorAddr;
  txns[1].genesisHash = params.genesisHash;
  txns[2].from = investorAddr;
  txns[2].to = stablecoinEscrowAddr;
  txns[2].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedCallManageAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[1]);
  const signedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[2]);
  const signedStablecoinTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[3], lsig);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallMainAppTxn.blob,
    signedCallManageAppTxn.blob,
    signedAlgoTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}