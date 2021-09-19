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
  appId: number,
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
  params.fee = 0;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("coupon")];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    fee: 2000,
    flatFee: true,
    type: "appl",
    from: investorAddr,
    appIndex: appId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: mainAppArgs,
    appAccounts: [bondEscrowAddr, stablecoinEscrowAddr],
    appForeignAssets: [bondId]
  }

  // 1. stablecoin payment
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
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[0].appAccounts = [bondEscrowAddr];

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedStablecoinTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[1], lsig);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallMainAppTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}
