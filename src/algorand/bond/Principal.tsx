import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { SuggestedParams, TxSig } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Create and submit a stateful smart contract
 */
export async function claimPrincipal(
  investorAddr: string,
  appId: number,
  issuerAddr: string,
  bondId: number,
  bondEscrowAddr: string,
  bondEscrowProgram: string,
  stablecoinEscrowAddr: string,
  stablecoinEscrowProgram: string,
  noOfBonds: number,
  bondPrincipal: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // 0. call app
  const enc = new TextEncoder();
  const sell: Uint8Array = enc.encode("sell");
  const appArgs: Uint8Array[] = [sell];
  const callAppTxn: CallApplTxn = {
    ...params,
    type: "appl",
    from: investorAddr,
    appIndex: appId,
    appOnComplete: 0,
    appArgs: appArgs
  }

  // 1. bond transfer
  const bondCompiledProgram = await algodClient.compile(bondEscrowProgram).do();
  const bondProgramBytes = new Uint8Array(
    Buffer.from(bondCompiledProgram.result, 'base64')
  );
  const bondLsig = algosdk.makeLogicSig(bondProgramBytes);
  const bondTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    bondEscrowAddr,
    bondEscrowAddr,
    bondEscrowAddr,
    investorAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 2. stablecoin payment
  const stablecoinCompiledProgram = await algodClient.compile(stablecoinEscrowProgram).do();
  const stablecoinProgramBytes = new Uint8Array(
    Buffer.from(stablecoinCompiledProgram.result, 'base64')
  );
  const stablecoinLsig = algosdk.makeLogicSig(stablecoinProgramBytes);
  const stablecoinTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    stablecoinEscrowAddr,
    investorAddr,
    undefined,
    undefined,
    noOfBonds * bondPrincipal,
    undefined,
    STABLECOIN_ID,
    params
  );

  // 3. pay fee for tx1
  const bondFeeTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: investorAddr,
    to: bondEscrowAddr,
    amount: 1000,
  };

  // pay fee for tx2
  const stablecoinFeeTransferTxn: PaymentTxn = {
    ...params,
    type: "pay",
    from: investorAddr,
    to: stablecoinEscrowAddr,
    amount: 1000,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callAppTxn,
    bondTransferTxn,
    stablecoinTransferTxn,
    bondFeeTransferTxn,
    stablecoinFeeTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[3].from = investorAddr;
  txns[3].to = bondEscrowAddr;
  txns[3].genesisHash = params.genesisHash;
  txns[4].from = investorAddr;
  txns[4].to = stablecoinEscrowAddr;
  txns[4].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedBondTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[1], bondLsig);
  const signedStablecoinTransferTxn: TxSig = algosdk.signLogicSigTransaction(txns[2], stablecoinLsig);
  const signedBondFeeTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[3]);
  const signedStablecoinFeeTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[4]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallAppTxn.blob,
    signedBondTransferTxn.blob,
    signedStablecoinTransferTxn.blob,
    signedBondFeeTransferTxn.blob,
    signedStablecoinFeeTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}