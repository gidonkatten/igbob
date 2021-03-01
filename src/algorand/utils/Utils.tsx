const algosdk = require('algosdk');

const SERVER: string = "http://127.0.0.1";
const PORT: number = 8080;
export const client = new algosdk.Algodv2(process.env.REACT_APP_ALGOD_TOKEN, SERVER, PORT);

/**
 * Function used to wait for a tx confirmation
 * @function
 * @param {any} algodclient -
 * @param {number} txId -
 */
export async function waitForConfirmation(algodclient: any, txId: number) {
  let response = await algodclient.status().do();
  let lastround = response["last-round"];
  while (true) {
    const pendingInfo = await algodclient.pendingTransactionInformation(txId).do();
    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
      // Got the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
      break;
    }
    lastround++;
    await algodclient.statusAfterBlock(lastround).do();
  }
}