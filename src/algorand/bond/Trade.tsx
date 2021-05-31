import { OnApplicationComplete, SuggestedParams } from "algosdk";
import { algodClient, numberToUint8Array, STABLECOIN_ID, waitForConfirmation } from '../utils/Utils';
import { AssetTxn, CallApplTxn, SignedTx } from '@randlabs/myalgo-connect';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';
import LogicSig from 'algosdk/dist/types/src/logicsig';

const algosdk = require('algosdk');

/**
 * Set number of bonds willing to trade
 */
export async function setTrade(
  mainAppId: number,
  selectedAddr: string,
  trade: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;

  const enc = new TextEncoder();
  const rate: Uint8Array = enc.encode("set_trade");

  const tradePassed: Uint8Array = numberToUint8Array(trade);

  const appArgs: Uint8Array[] = [rate, tradePassed];
  const callMainAppTxn: CallApplTxn = {
    ...params,
    flatFee: true,
    type: "appl",
    from: selectedAddr,
    appIndex: mainAppId,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs: appArgs,
  }

  let rawSignedOptTxn: SignedTx = await myAlgoWallet.signTransaction(callMainAppTxn);
  let tx = (await algodClient.sendRawTransaction(rawSignedOptTxn.blob).do());

  console.log("Transaction : " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}

/**
 * Sign trade lsig
 */
export async function signTradeLSig(
  program: Uint8Array,
  selectedAddr: string,
) {
  return await myAlgoWallet.signLogicSig(program, selectedAddr);
}

/**
 * Submit trade transaction group
 */
export async function tradeBond(
  lsig: Uint8Array,
  lsigProgram: string,
  sellerAddr: string,
  selectedAddr: string,
  mainAppId: number,
  bondId: number,
  bondEscrowAddr: string,
  bondEscrowProgram: string,
  noOfBonds: number,
  price: number,
) {
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.flatFee = true;
  params.fee = 1000;

  const enc = new TextEncoder();

  // 0. call main app
  const mainAppArgs: Uint8Array[] = [enc.encode("trade")];
  const callMainAppTxn = algosdk.makeApplicationNoOpTxn(
    sellerAddr,
    params,
    mainAppId,
    mainAppArgs,
    [selectedAddr]
  )

  // 1. fee for tx2
  const bondFeeTransferTxn = algosdk.makePaymentTxnWithSuggestedParams(
    sellerAddr,
    bondEscrowAddr,
    1000,
    undefined,
    undefined,
    params,
  )

  // 2. bond transfer
  const bondCompiledProgram = await algodClient.compile(bondEscrowProgram).do();
  const bondProgramBytes = new Uint8Array(
    Buffer.from(bondCompiledProgram.result, 'base64')
  );
  const bondLsig: LogicSig = algosdk.makeLogicSig(bondProgramBytes);
  const bondTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    bondEscrowAddr,
    selectedAddr,
    undefined,
    sellerAddr,
    noOfBonds,
    undefined,
    bondId,
    params
  )

  // 3. stablecoin payment
  const stablecoinTransferTxn: AssetTxn = {
    ...params,
    flatFee: true,
    type: "axfer",
    assetIndex: STABLECOIN_ID,
    from: selectedAddr,
    to: sellerAddr,
    amount: noOfBonds * price,
  };

  // Assign group id to transactions
  let txns = algosdk.assignGroupID([
    callMainAppTxn,
    bondFeeTransferTxn,
    bondTransferTxn,
    stablecoinTransferTxn
  ]);

  // Override so can sign with myAlgo
  txns[3].from = selectedAddr;
  txns[3].to = sellerAddr;
  txns[3].genesisHash = params.genesisHash;

  // Get seller lsig
  const tradeCompiledProgram = await algodClient.compile(lsigProgram).do();
  const tradeProgramBytes = new Uint8Array(
    Buffer.from(tradeCompiledProgram.result, 'base64')
  );
  const sellerLsig: LogicSig = algosdk.makeLogicSig(tradeProgramBytes);
  sellerLsig.sig = Uint8Array.from(lsig);

  // Sign transactions
  const signedCallMainAppTxn: SignedTx = algosdk.signLogicSigTransaction(txns[0], sellerLsig);
  const signedBondFeeTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[1], sellerLsig);
  const signedBondTransferTxn: SignedTx = algosdk.signLogicSigTransaction(txns[2], bondLsig);
  const signedStablecoinTransferTxn: SignedTx = await myAlgoWallet.signTransaction(txns[3]);

  // Group
  const signedTxs: Uint8Array[] = [
    signedCallMainAppTxn.blob,
    signedBondFeeTransferTxn.blob,
    signedBondTransferTxn.blob,
    signedStablecoinTransferTxn.blob
  ];

  // Send
  let tx = (await algodClient.sendRawTransaction(signedTxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for confirmation
  await waitForConfirmation(tx.txId);
}