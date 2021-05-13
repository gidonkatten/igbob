const algosdk = require('algosdk');

const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
const indexerServer = 'https://testnet-algorand.api.purestake.io/idx2'
const port = '';
const token = { 'X-API-Key': process.env.REACT_APP_PURESTAKE_API_KEY }
export const algodClient = new algosdk.Algodv2(token, algodServer, port);
export const indexerClient = new algosdk.Indexer(token, indexerServer, port);

export const STABLECOIN_ID = 15435388;

/**
 * Utility function to wait on a transaction to be confirmed
 * the timeout parameter indicates how many rounds do you wish to check pending transactions for
 */
export const waitForConfirmation = async function (txId: string, timeout: number = 1000) {
  if (algodClient == null || txId == null || timeout < 0) {
    throw new Error("Bad arguments.");
  }

  const status = (await algodClient.status().do());
  if (status === undefined) throw new Error("Unable to get node status");

  const startround = status["last-round"] + 1;
  let currentround = startround;

  while (currentround < (startround + timeout)) {
    let pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingInfo !== undefined) {
      if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
        //Got the completed Transaction
        return pendingInfo;
      }
      else {
        if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
          // If there was a pool error, then the transaction has been rejected!
          throw new Error("Transaction Rejected pool error" + pendingInfo["pool-error"]);
        }
      }
    }
    await algodClient.statusAfterBlock(currentround).do();
    currentround++;
  }

  throw new Error("Transaction not confirmed after " + timeout + " rounds!");
};

/**
 * Generates transaction group file for array of signed transactions.
 * To get trace STATELESS:
 * "goal clerk dryrun -t <name>.txns"
 * To get debugger STATELESS and STATEFUL:
 * 1. "goal clerk dryrun -t <name>.txns --dryrun-dump -o dr.json"
 * 2.a. STATELESS "tealdbg debug <PATH_TO_STATELESS_TEAL> -d dr.json -g <group_index>"
 * 2.b. STATEFUL "tealdbg debug -d dr.json -g <group_index>"
 */
export function downloadTxns(name: string, txns: any[]) {
  let b = new Uint8Array(0);
  for (const txn in txns){
    b = concatTypedArrays(b, txns[txn])
  }
  const blob = new Blob([b], { type: "application/octet-stream" });

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = name + ".txns";
  link.click();
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
  const c = new (a.constructor)(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

/**
 * Converts number to Uint8Array
 */
export function numberToUint8Array(number: number): Uint8Array {
  let hex = BigInt(number).toString(16);
  if (hex.length % 2) { hex = '0' + hex; }

  let len = hex.length / 2;
  let u8 = new Uint8Array(len);

  let i = 0;
  let j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j+2), 16);
    i += 1;
    j += 2;
  }

  return u8;
}
