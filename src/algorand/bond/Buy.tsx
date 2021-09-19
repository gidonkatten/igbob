import { algodClient, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, CallApplTxn, PaymentTxn, SignedTx, } from '@randlabs/myalgo-connect';
import { OnApplicationComplete, SuggestedParams } from 'algosdk';
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
  params.flatFee = true;
  params.fee = 0;

  // 0. call app
  const enc = new TextEncoder();
  const buy: Uint8Array = enc.encode("buy");
  const appArgs: Uint8Array[] = [buy];
  const callAppTxn: CallApplTxn = {
    ...params,
    fee: 3000,
    flatFee: true,
    type: "appl",
    from: investorAddr,
    appIndex: appId,
    appOnComplete: OnApplicationComplete.NoOpOC,
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
    investorAddr,
    undefined,
    bondEscrowAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 2. stablecoin payment
  const stablecoinTransferTxn: AssetTxn = {
    ...params,
    flatFee: true,
    type: "axfer",
    from: investorAddr,
    assetIndex: STABLECOIN_ID,
    to: issuerAddr,
    amount: noOfBonds * bondCost,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callAppTxn,
    bondTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[0].from = investorAddr;
  txns[0].genesisHash = params.genesisHash;
  txns[2].from = investorAddr;
  txns[2].to = issuerAddr;
  txns[2].genesisHash = params.genesisHash;

  // Sign transactions
  const signedCallAppTxn: SignedTx = await myAlgoWallet.signTransaction(txns[0]);
  const signedBondTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[1], lsig);
  const signedStablecoinTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[2]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallAppTxn.blob,
    signedBondTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}
