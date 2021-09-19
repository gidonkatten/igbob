import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { OnApplicationComplete, SuggestedParams } from 'algosdk';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';

const algosdk = require('algosdk');

/**
 * Claim default for a bond
 */
export async function claimDefault(
  investorAddr: string,
  appId: number,
  issuerAddr: string,
  bondId: number,
  bondEscrowAddr: string,
  bondEscrowProgram: string,
  stablecoinEscrowAddr: string,
  stablecoinEscrowProgram: string,
  noOfBonds: number,
  defaultAmount: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.flatFee = true;
  params.fee = 0;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("default")];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    fee: 3000,
    type: "appl",
    from: investorAddr,
    appIndex: appId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: mainAppArgs,
    appAccounts: [bondEscrowAddr, stablecoinEscrowAddr],
    appForeignAssets: [bondId],
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
    undefined,
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
    Math.floor(defaultAmount),
    undefined,
    STABLECOIN_ID,
    params
  );

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callMainAppTxn,
    bondTransferTxn,
    stablecoinTransferTxn,
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedBondTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[1], bondLsig);
  const signedStablecoinTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[2], stablecoinLsig);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallMainAppTxn.blob,
    signedBondTransferTxn.blob,
    signedStablecoinTransferTxn.blob,
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}
