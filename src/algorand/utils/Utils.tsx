const algosdk = require('algosdk');

const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
const port = '';
const token = { 'X-API-Key': process.env.REACT_APP_PURESTAKE_API_KEY }
export const algodClient = new algosdk.Algodv2(token, baseServer, port);

export const STABLECOIN_ID = 15435388;

/**
 * utility function to wait on a transaction to be confirmed
 * the timeout parameter indicates how many rounds do you wish to check pending transactions for
 */
export const waitForConfirmation = async function (txId: string, timeout: number = 1000) {
  // Wait until the transaction is confirmed or rejected, or until 'timeout'
  // number of rounds have passed.
  //     Args:
  // txId(str): the transaction to wait for
  // timeout(int): maximum number of rounds to wait
  // Returns:
  // pending transaction information, or throws an error if the transaction
  // is not confirmed or rejected in the next timeout rounds
  if (algodClient == null || txId == null || timeout < 0) {
    throw new Error("Bad arguments.");
  }
  let status = (await algodClient.status().do());
  if (status === undefined) throw new Error("Unable to get node status");
  let startround = status["last-round"] + 1;
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

