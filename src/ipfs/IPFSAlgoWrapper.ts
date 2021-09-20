import { PaymentTxn, SignedTx } from '@randlabs/myalgo-connect';
import { SuggestedParams } from 'algosdk';
import { algodClient, indexerClient, waitForConfirmation } from '../algorand/utils/Utils';
import { myAlgoWallet } from '../algorand/wallet/myAlgo/MyAlgoWallet';
import { App } from '../redux/types';

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

    const note: Uint8Array = new Uint8Array(
      Buffer.from(manageAppId + "+" + couponRound + "+" + cid)
    );

    const txn: PaymentTxn = {
      ...params,
      flatFee: true,
      fee: 1000,
      type: "pay",
      from: issuerAddr,
      to: issuerAddr,
      amount: 0,
      note
    };

    const rawSignedTxn: SignedTx = await myAlgoWallet.signTransaction(txn);
    const tx = await algodClient.sendRawTransaction(rawSignedTxn.blob).do();

    console.log("Transaction : " + tx.txId);

    // Wait for confirmation
    await waitForConfirmation(tx.txId);
  }

  public async getData(app: App): Promise<{ cid: string, time: number }[][]> {
    const { issuer_address, app_id, bond_length } = app;
    const prefix: Uint8Array = new Uint8Array(Buffer.from(app_id + '+'));

    // TODO: Use afterTime() beforeTime() to verify upload time within bounds
    const res = await indexerClient.lookupAccountTransactions(issuer_address)
      .notePrefix(prefix).do()

    // could have more than one CID for given round
    const cids: { cid: string, time: number }[][] = new Array(bond_length + 1);
    for (let i = 0; i < cids.length; i++) cids[i] = [];

    res.transactions.forEach(txn => {
      const time: number = txn['round-time']
      const note: string | undefined = txn.note ? atob(txn.note) : undefined;

      if (note) {
        // note format: "<MANAGE_APP_ID>+<COUPON_ROUND>+<CID>"
        const split = note.split('+')
        if (split.length === 3) {
          const round = parseInt(split[1]);
          const cid = split[2];
          cids[round].push({ cid, time });
        }
      }
    });

    return cids;
  }

}
