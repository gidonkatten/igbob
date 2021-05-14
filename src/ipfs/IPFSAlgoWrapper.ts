import { PaymentTxn, SignedTx } from '@randlabs/myalgo-connect';
import { SuggestedParams } from 'algosdk';
import { algodClient, indexerClient, waitForConfirmation } from '../algorand/utils/Utils';
import { myAlgoWallet } from '../algorand/wallet/myAlgo/MyAlgoWallet';

const IPFS = require('ipfs');

export class IPFSAlgoWrapper {

  private static node;

  public async init() {
    IPFSAlgoWrapper.node = await IPFS.create()
    const version = await IPFSAlgoWrapper.node.version()
    console.log('IPFS version:', version.version)
  }

  public async addData(
    data: File,
    issuerAddr: string,
    manageAppId: number,
    couponRound: number
  ) {
    const result = await IPFSAlgoWrapper.node.add(data);
    const cid: string = result.cid.toString();
    console.log("Content Identifier: " + cid);

    // send tx with cid in note field
    const params: SuggestedParams = await algodClient.getTransactionParams().do();

    const txn: PaymentTxn = {
      ...params,
      flatFee: true,
      type: "pay",
      from: issuerAddr,
      to: issuerAddr,
      amount: 0,
      note: manageAppId + "+" + couponRound + "+" + cid
    };

    const rawSignedTxn: SignedTx = await myAlgoWallet.signTransaction(txn);
    const tx = await algodClient.sendRawTransaction(rawSignedTxn.blob).do();

    console.log("Transaction : " + tx.txId);

    // Wait for confirmation
    await waitForConfirmation(tx.txId);
  }

  public async getData(
    issuerAddr: string,
    manageAppId: number,
    couponRound: number
  ): Promise<string[][]> {
    const prefix: Uint8Array = new Uint8Array(
      Buffer.from(manageAppId + '+', 'base64')
    );

    const res = await indexerClient.lookupAccountTransactions(issuerAddr)
      .notePrefix(prefix).do()

    // could have more than one CID for given round
    const cids: string[][] = new Array<string[]>(couponRound + 1);
    for (let i = 0; i < cids.length; i++) cids[i] = [];

    res.transactions.forEach(txn => {
      // note format: "<MANAGE_APP_ID>+<COUPON_ROUND>+<CID>"
      const note: string | undefined = txn.note;
      if (note) {
        const split = note.split('+')
        const round = parseInt(split[1]);
        const cid = split[2];
        cids[round].push(cid);
      }
    });

    return cids;
  }

}
