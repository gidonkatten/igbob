import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { OnApplicationComplete, SuggestedParams } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Claim principal for a bond
 */
export async function claimPrincipal(
  investorAddr: string,
  mainAppId: number,
  manageAppId: number,
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
  params.flatFee = true;
  params.fee = 1000;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("sell")];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: investorAddr,
    appIndex: mainAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: mainAppArgs
  }

  // 1. call manage app
  const manageAppArgs: Uint8Array[] = [enc.encode("not_defaulted")];
  const callManageAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: investorAddr,
    appIndex: manageAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: manageAppArgs,
    appAccounts: [stablecoinEscrowAddr, bondEscrowAddr],
    appForeignApps: [mainAppId],
    appForeignAssets: [bondId]
  }

  // 2. bond transfer
  const bondCompiledProgram = await algodClient.compile(bondEscrowProgram).do();
  const bondProgramBytes = new Uint8Array(
    Buffer.from(bondCompiledProgram.result, 'base64')
  );
  const bondLsig = algosdk.makeLogicSig(bondProgramBytes);
  const bondTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    bondEscrowAddr,
    bondEscrowAddr,
    undefined,
    investorAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 3. stablecoin payment
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

  // 4. pay fee for tx2
  const bondFeeTransferTxn: PaymentTxn = {
    ...params,
    flatFee: true,
    type: "pay",
    from: investorAddr,
    to: bondEscrowAddr,
    amount: 1000,
  };

  // 5. pay fee for tx3
  const stablecoinFeeTransferTxn: PaymentTxn = {
    ...params,
    flatFee: true,
    type: "pay",
    from: investorAddr,
    to: stablecoinEscrowAddr,
    amount: 1000,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callMainAppTxn,
    callManageAppTxn,
    bondTransferTxn,
    stablecoinTransferTxn,
    bondFeeTransferTxn,
    stablecoinFeeTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[1].from = investorAddr;
  txns[1].appAccounts = [stablecoinEscrowAddr, bondEscrowAddr];
  txns[1].genesisHash = params.genesisHash;
  txns[4].from = investorAddr;
  txns[4].to = bondEscrowAddr;
  txns[4].genesisHash = params.genesisHash;
  txns[5].from = investorAddr;
  txns[5].to = stablecoinEscrowAddr;
  txns[5].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedCallManageAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[1]);
  const signedBondTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[2], bondLsig);
  const signedStablecoinTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[3], stablecoinLsig);
  const signedBondFeeTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[4]);
  const signedStablecoinFeeTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[5]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallMainAppTxn.blob,
    signedCallManageAppTxn.blob,
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