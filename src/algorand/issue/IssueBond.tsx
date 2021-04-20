import { algodClient, fundAccount, waitForConfirmation } from '../utils/Utils';
import { myAlgoWallet } from '../wallet/myAlgo/MyAlgoWallet';
import { Account, SuggestedParams } from 'algosdk';
import { SignedTx } from '@randlabs/myalgo-connect';
import { createAsset } from '../assets/CreateAsset';
import { createStatefulContract, StateStorage } from '../contracts/CreateStatefulContract';
import { encodeUint64, stringToUint64 } from '../contracts/Utils';
import { convertDateToUnixTime } from '../../utils/Utils';

const algosdk = require('algosdk');

/**
 * Issue bond
 * @function
 * @param {number} totalIssuance -
 * @param {string} bondUnitName -
 * @param {string} bondName -
 * @param {string} issuerAddr -
 * @param {string} startBuyDate -
 * @param {string} endBuyDate -
 * @param {string} maturityDate -
 * @param {number} bondCost -
 * @param {number} bondCouponPaymentVal -
 * @param {number} bondCouponInstallments -
 * @param {number} bondPrincipal -
 */

export async function issueBond(
  totalIssuance: number,
  bondUnitName: string,
  bondName: string,
  issuerAddr: string,
  startBuyDate: string,
  endBuyDate: string,
  maturityDate: string,
  bondCost: number,
  bondCouponPaymentVal: number,
  bondCouponInstallments: number,
  bondPrincipal: number,
): Promise<void> {
  // Get node suggested parameters
  let params: SuggestedParams = await algodClient.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  // new algo account which will create bond + contract
  const account: Account = algosdk.generateAccount();

  // fund account with min balance needed
  const fundTxId: string = await fundAccount(account.addr, 0, params);
  await waitForConfirmation(fundTxId);

  // create bond (frozen)
  const bondId: number = await createAsset(totalIssuance, 0, true,
    bondUnitName, bondName, params);

  // create contract
  const stateStorage: StateStorage = {
    localInts: 2,
    localBytes: 0,
    globalInts: 8,
    globalBytes: 2,
  }

  const ia = stringToUint64(issuerAddr);
  const sbd: Uint8Array = encodeUint64(convertDateToUnixTime(startBuyDate));
  const ebd: Uint8Array = encodeUint64(convertDateToUnixTime(endBuyDate));
  const md: Uint8Array = encodeUint64(convertDateToUnixTime(maturityDate));
  const bid: Uint8Array = encodeUint64(bondId);
  const bc: Uint8Array = encodeUint64(bondCost);
  const bcpv: Uint8Array = encodeUint64(bondCouponPaymentVal);
  const bci: Uint8Array = encodeUint64(bondCouponInstallments);
  const bp: Uint8Array = encodeUint64(bondPrincipal);
  const appArgs = [ia, sbd, ebd, md, bid, bc, bcpv, bci, bp];

  await createStatefulContract(
    "http://localhost:5000/approval_program",
    "http://localhost:5000/clear_program",
    stateStorage,
    // appArgs,
    [],
    params
  );

  // create escrow addresses for bond and stablecoin

  // fund escrow addresses with some algo to get going

  // opt in escrow address to bond and stablecoin respectively

  // send bonds to bonds escrow address

  // set bond escrows address to be bond clawback

  // lock bond by clearing the freezer and manager
}