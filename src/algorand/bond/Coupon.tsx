import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { OnApplicationComplete, SuggestedParams } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';
import { getMultiplier } from '../../investor/Utils';

const algosdk = require('algosdk');

/**
 * Claim coupon for a bond
 */
export async function claimCoupon(
  investorAddr: string,
  mainAppId: number,
  manageAppId: number,
  bondId: number,
  bondEscrowAddr: string,
  stablecoinEscrowAddr: string,
  stablecoinEscrowProgram: string,
  noOfBonds: number,
  bondCoupon: number,
  rating: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.flatFee = true;
  params.fee = 1000;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("coupon")];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: investorAddr,
    appIndex: mainAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: mainAppArgs,
    appForeignApps: [manageAppId]
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

  // 2. pay fee for tx3
  const algoTransferTxn: PaymentTxn = {
    ...params,
    flatFee: true,
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
    Math.floor( bondCoupon * getMultiplier(rating)) * noOfBonds,
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
  txns[1].appAccounts = [stablecoinEscrowAddr, bondEscrowAddr];
  txns[1].genesisHash = params.genesisHash;
  txns[2].from = investorAddr;
  txns[2].to = stablecoinEscrowAddr;
  txns[2].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedCallManageAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[1]);
  const signedAlgoTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[2]);
  const signedStablecoinTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[3], lsig);

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